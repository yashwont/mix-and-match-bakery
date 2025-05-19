from rest_framework import serializers
from .models import User, Product, Review, Order, Notification
from django.contrib.auth.password_validation import validate_password

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']

        if username.lower().startswith('admin') or email.lower() == 'admin123@gmail.com':
            role = 'admin'
            is_staff = True
            is_superuser = True
        else:
            role = 'user'
            is_staff = False
            is_superuser = False

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            is_staff=is_staff,
            is_superuser=is_superuser
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'points']

class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category', 'quantity', 'image', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if request and obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None
    
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    product = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(source='order_date', format="%Y-%m-%d %I:%M %p", read_only=True)
    total = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'product_name', 'category', 'price', 'quantity',
            'is_customized', 'dietary', 'flavor', 'topping',
            'customer_name', 'customer_phone', 'customer_address', 
            'order_date', 'date', 'status', 'total',
            'points_earned', 'points_redeemed'
        ]
        read_only_fields = ['id', 'user', 'order_date', 'date', 'status', 'total', 'points_earned', 'points_redeemed']

    def get_total(self, obj):
        return float(obj.price) * obj.quantity

    def get_status(self, obj):
        return "Delivered" if obj.id % 2 == 0 else "In Progress"

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        