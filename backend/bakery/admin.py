from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Product, Review, Order

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role info', {'fields': ('role',)}),
    )
    search_fields = ('username', 'email')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'category', 'quantity')
    list_filter = ('category',)
    search_fields = ('name', 'category')
    ordering = ('-id',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'user__username')
    ordering = ('-created_at',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'product_name', 'customer_name', 'customer_phone',
        'customer_address',
        'category', 'price', 'quantity',
        'is_customized', 'order_date'
    ]
    list_filter = ['is_customized', 'category', 'order_date']
    search_fields = ['product_name', 'customer_name', 'customer_phone', 'customer_address']
    list_display_links = ('id', 'product_name')
    readonly_fields = ('order_date',)
    list_editable = ('quantity', 'price')
