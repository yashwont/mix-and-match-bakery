from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Cakes', 'Cakes'),
        ('Cookies', 'Cookies'),
        ('Pastries', 'Pastries'),
        ('Muffins', 'Muffins'),
        ('Breads', 'Breads'),
        ('Brownies', 'Brownies'),
    ]

    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    def __str__(self):
        return self.name

    def image_url(self):
        return self.image.url if self.image else ''
    
class Review(models.Model):
    product = models.ForeignKey("Product", on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} - {self.rating}★"
    
class Order(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
        null=True,
        blank=True
    )

    product_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    is_customized = models.BooleanField(default=False)
    dietary = models.CharField(max_length=100, blank=True)
    flavor = models.CharField(max_length=100, blank=True)
    topping = models.CharField(max_length=100, blank=True)
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()
    order_date = models.DateTimeField(auto_now_add=True)
    points_earned = models.IntegerField(default=0)
    points_redeemed = models.IntegerField(default=0)

    def __str__(self):
        return self.product_name


from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('order', 'Order'),
        ('payment', 'Payment'),
        ('reward', 'Reward Points'),
        ('review', 'Review'),
        ('security', 'Security'),
        ('user_activity', 'User Activity'),
        ('product', 'Product Management'),
        ('stock', 'Stock Management'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    is_for_admin = models.BooleanField(default=False)
    event_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='other')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.is_for_admin:
            return f"Admin - {self.title}"
        elif self.user:
            return f"{self.user.username} - {self.title}"
        return f"System - {self.title}"

    def mark_as_read(self):
        """Mark this notification as read and save it."""
        if not self.is_read:
            self.is_read = True
            self.save()

