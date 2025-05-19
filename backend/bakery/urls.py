from django.urls import path, include
from .views import SignupView, GoogleLoginView, SetPasswordView, RequestPasswordResetEmail, PasswordResetConfirmView, EmailLoginView, UserProfileView, UserListView, ProductViewSet, ReviewViewSet, SubmitOrderView, UserOrderListView, AdminOrderListView, create_payment_intent, esewa_initiate_payment, NotificationListView, NotificationUpdateView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')

review_list = ReviewViewSet.as_view({
    'get': 'list',
    'post': 'create'
})


urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('email-login/', EmailLoginView.as_view(), name='email_login'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path("set-password/", SetPasswordView.as_view(), name="set-password"),
    path('request-reset-email/', RequestPasswordResetEmail.as_view(), name='request-reset-email'),
    path('reset-password/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='reset-password'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('', include(router.urls)),
    path('products/<int:product_id>/reviews/', review_list, name='product-reviews'),
    path("place-order/", SubmitOrderView.as_view(), name="place-order"),
    path('user-orders/', UserOrderListView.as_view(), name='user-orders'),
    path('orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('create-payment-intent/', create_payment_intent, name='create-payment-intent'),
    path('esewa/initiate/', esewa_initiate_payment, name="esewa-initiate"),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationUpdateView.as_view(), name='notification-update'),
]
