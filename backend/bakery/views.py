from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions, generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate, get_user_model
from google.oauth2 import id_token
import random, requests
import string
import stripe
import hashlib
import base64
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_bytes, smart_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from google.auth.transport import requests as google_requests
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserSignupSerializer, UserProfileSerializer, ProductSerializer, ReviewSerializer, OrderSerializer, NotificationSerializer
from .models import User, Product, Review, Order, Notification
from rest_framework.generics import RetrieveUpdateAPIView

User = get_user_model()

GOOGLE_CLIENT_ID = "733522699168-ld8meu8tre3f1eate0nlfqs1tjdkac27.apps.googleusercontent.com"

stripe.api_key = settings.STRIPE_SECRET_KEY

ESEWA_CLIENT_ID = settings.ESEWA_CLIENT_ID
ESEWA_CLIENT_SECRET = settings.ESEWA_CLIENT_SECRET
ESEWA_SECRET_KEY = settings.ESEWA_SECRET_KEY
ESEWA_INITIATE_URL = settings.ESEWA_INITIATE_URL

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SetPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_password = request.data.get("password")

        if not new_password or len(new_password) < 6:
            return Response({"error": "Password must be at least 6 characters."}, status=400)

        user = request.user
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password set successfully!"}, status=200)


class EmailLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=user.username, password=password)

        if user is not None:
            token = TokenObtainPairSerializer().get_token(user)
            refresh = str(token)
            access = str(token.access_token)

            Notification.objects.create(
                user=user,
                event_type='security',
                title='New Login Detected',
                message='A new login to your account was detected.'
            )

            return Response({
                'refresh': refresh,
                'access': access,
                'username': user.username,
                'role': user.role
            })
        else:
            return Response({'error': 'Invalid password.'}, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("Received request data:", request.data)  

        token = request.data.get("token")

        if not token:
            return Response({"error": "Missing token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

            email = idinfo.get("email")
            name = idinfo.get("name", email.split("@")[0])
            username = name.replace(" ", "") or email.split("@")[0]

            if not email:
                return Response({"error": "Email not available in token"}, status=400)

            if name.lower().startswith('admin') or email.lower() == 'admin123@gmail.com':
                role = "admin"
                is_staff = True
                is_superuser = True
            else:
                role = "user"
                is_staff = False
                is_superuser = False

            user, created = User.objects.get_or_create(email=email, defaults={
                "username": username,
                "role": role,
                "is_staff": is_staff,
                "is_superuser": is_superuser,
            })

            if not user.has_usable_password():
                random_pass = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
                user.set_password(random_pass)
                user.save()

            has_password = user.has_usable_password()

            if created:
                send_mail(
                    subject="Welcome to Mix & Match Bakery 🍰",
                    message=f"Hello {username},\n\nThanks for signing in using Google! You can now log in with your email too. If you ever forget your password, just use the 'Forgot Password' option.",
                    from_email="no-reply@yourdomain.com",
                    recipient_list=[email],
                    fail_silently=False
                )

            refresh = RefreshToken.for_user(user)

            Notification.objects.create(
                user=user,
                event_type='security',
                title='New Login Detected',
                message='A new login to your account was detected.'
            )

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "role": user.role,
                "is_new": created,
                "hasPassword": has_password,
            })

        except ValueError as ve:
            print(f"[GOOGLE LOGIN ERROR]", ve)
            return Response({"error": "Token verification failed", "details": str(ve)}, status=400)

        except Exception as e:
            return Response({"error": "Something went wrong", "details": str(e)}, status=500)


class RequestPasswordResetEmail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "")
        if not email:
            return Response({"error": "Email is required"}, status=400)

        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            reset_url = f"http://localhost:3000/reset-password/{uidb64}/{token}/"

            send_mail(
                subject="Reset your password",
                message=f"Click the link below to reset your password:\n\n{reset_url}",
                from_email="no-reply@yourdomain.com",
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)

        return Response({"error": "User with this email does not exist"}, status=404)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=uid)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({"error": "Token is invalid or expired"}, status=400)

            new_password = request.data.get("password")
            if not new_password:
                return Response({"error": "Password is required"}, status=400)
            user.set_password(new_password)
            user.save()
            Notification.objects.create(
                user=user,
                event_type='security',
                title='Password Reset Successful',
                message='You have successfully reset your password.'
            )
            return Response({"message": "Password reset successful"}, status=200)
        except Exception as e:
            return Response({"error": "Something went wrong"}, status=400)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class UserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.filter(role='user')
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        return {'request': self.request}

    def create(self, request, *args, **kwargs):
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product=serializer.save()
            product_name = product.name
            Notification.objects.create(
                is_for_admin=True,
                event_type='product',
                title='New Product Added',
                message=f"Product '{product_name}' has been added to the store."
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        product = self.get_object()
        serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_product=serializer.save()
            product_name = updated_product.name
            Notification.objects.create(
                is_for_admin=True,
                event_type='product',
                title='Product Updated',
                message=f"Product '{product_name}' details have been updated."
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return Review.objects.filter(product_id=product_id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['product_id'] = self.kwargs.get('product_id')
        return context

    def perform_create(self, serializer):
        product = Product.objects.get(id=self.kwargs['product_id'])
        review=serializer.save(user=self.request.user, product=product)
        
        Notification.objects.create(
            user=self.request.user,
            event_type='user_activity',
            title='Thank you for your review!',
            message=f"You rated '{product.name}' {review.rating}★."
        )
        Notification.objects.create(
            is_for_admin=True,
            event_type='user_activity',
            title='New Product Review',
            message=f"{self.request.user.username} rated '{product.name}' {review.rating}★."
            )

class SubmitOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        orders_data = request.data.get('orders', [])
        use_points = request.data.get('use_points', False)
        created_orders = []

        total_amount = sum(float(item.get("price", 0)) * int(item.get("quantity", 1)) for item in orders_data)

        discount = 0
        if use_points and request.user.points >= 100:
            discount = total_amount * 0.10  # 10% discount
            request.user.points -= 100      # Redeem 100 points

        for item in orders_data:
            try:
                serializer = OrderSerializer(data=item)
                if serializer.is_valid():
                    order = serializer.save(user=request.user)

                    product = Product.objects.filter(name=item.get("product_name")).first()
                    if product:
                        product.quantity = max(0, product.quantity - order.quantity)
                        product.save()

                        if product.quantity == 0:
                            Notification.objects.create(
                                is_for_admin=True,
                                event_type='stock',
                                title='Stock Finished',
                                message=f"The stock for product '{product.name}' has finished."
                            )

                    # 🎯 Calculate earned points (after discount applied per order)
                    effective_price = float(order.price) * order.quantity
                    proportion_of_total = effective_price / total_amount if total_amount else 0
                    effective_discount = discount * proportion_of_total
                    final_price = effective_price - effective_discount
                    earned = int(final_price // 10)

                    order.points_earned = earned
                    order.points_redeemed = 100 if use_points and discount > 0 else 0
                    order.save()

                    created_orders.append(OrderSerializer(order).data)

                else:
                    return Response(serializer.errors, status=400)
            except Exception as e:
                return Response({"error": "Failed to process order", "details": str(e)}, status=500)

        # 💾 Save user points
        request.user.points += sum(order['points_earned'] for order in created_orders)
        request.user.save()
        
        Notification.objects.create(
            user=request.user,
            event_type='order',
            title='Order Placed Successfully',
            message='Your order has been placed. Thank you for shopping with us!'
            )
        
        Notification.objects.create(
            is_for_admin=True,
            event_type='user_activity',
            title='New Order Received',
            message=f"New order placed by {request.user.username}."
            )
        
        if sum(order['points_earned'] for order in created_orders) > 0:
            Notification.objects.create(
                user=request.user,
                event_type='reward',
                title='Reward Points Updated',
                message=f"You have earned {sum(order['points_earned'] for order in created_orders)} reward points!"
                )

        return Response({
            "message": "Order placed successfully!",
            "orders": created_orders,
            "discount": discount
        }, status=201)


class AdminOrderListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.all().order_by('-order_date')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class UserOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_orders = Order.objects.filter(user=request.user).order_by('-order_date')
        serializer = OrderSerializer(user_orders, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    try:
        amount = int(request.data.get('amount')) 
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            payment_method_types=["card"],
        )
        Notification.objects.create(
            user=request.user,
            event_type='payment',
            title='Payment Initiated',
            message='Your payment is being processed successfully.'
        )

        return Response({'clientSecret': intent['client_secret']})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
@api_view(["POST"])
@permission_classes([AllowAny])
def esewa_initiate_payment(request):
    try:
        print(" Incoming request:", request.data)

        amount = str(request.data.get('amount'))
        transaction_uuid = request.data.get('pid')

        if not amount or not transaction_uuid:
            print(" Missing required fields")
            return Response({"error": "Missing required fields"}, status=400)

        print("✅ Step 1 Passed: Fields Present")
        signed_field_names = "amount,transaction_uuid,product_code,signed_field_names"
        sign_string = (
            f"amount={amount},"
            f"transaction_uuid={transaction_uuid},"
            f"product_code=EPAYTEST,"
            f"signed_field_names={signed_field_names}"
        ) + ESEWA_SECRET_KEY

        print(" Signature string before hashing:", sign_string)

        signature = base64.b64encode(hashlib.sha256(sign_string.encode()).digest()).decode()

        payload = {
            "amount": str(amount),
            "product_code": "EPAYTEST",
            "transaction_uuid": transaction_uuid,
            "success_url": "http://localhost:3000/payment-success",
            "failure_url": "http://localhost:3000/payment-fail",
            "signed_field_names": signed_field_names,
            "signature": signature,
        }

        print(" Payload to eSewa:", payload)

        basic_auth = f"{ESEWA_CLIENT_ID.strip()}:{ESEWA_CLIENT_SECRET.strip()}"
        encoded_auth = base64.b64encode(basic_auth.encode()).decode()

        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Content-Type": "application/json",
            "User-Agent": "Esewa-Test/1.0"
        }

        print(" Headers:", headers)
        response = requests.post(ESEWA_INITIATE_URL, json=payload, headers=headers)

        print("🌐 eSewa Response Code:", response.status_code)

        if response.status_code == 200:
            return Response(response.json())
        else:
            return Response({"error": "Failed to initiate payment", "details": response.text}, status=400)

    except Exception as e:
        print(" Exception caught:", str(e))
        return Response({"error": str(e)}, status=500)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Admin will see only admin notifications
            return Notification.objects.filter(is_for_admin=True).order_by('-created_at')
        else:
            # Users will see their own notifications
            return Notification.objects.filter(user=user).order_by('-created_at')

class NotificationUpdateView(RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Notification.objects.filter(is_for_admin=True)
        return Notification.objects.filter(user=user)
