import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../database.dart';
import 'package:uuid/uuid.dart';

class CartItem {
  final Product product;
  int quantity;
  final String? notes;

  CartItem({required this.product, this.quantity = 1, this.notes});

  double get totalPrice => product.price * quantity;
}

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];
  final ApiService _apiService = ApiService();
  String _paymentMethod = 'CASH';

  List<CartItem> get items => _items;
  String get paymentMethod => _paymentMethod;

  double get totalAmount {
    return _items.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  void setPaymentMethod(String method) {
    _paymentMethod = method;
    notifyListeners();
  }

  void addToCart(Product product) {
    final existingIndex = _items.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      _items[existingIndex].quantity++;
    } else {
      _items.add(CartItem(product: product));
    }
    notifyListeners();
  }

  void decreaseQuantity(Product product) {
    final existingIndex = _items.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      if (_items[existingIndex].quantity > 1) {
        _items[existingIndex].quantity--;
      } else {
        _items.removeAt(existingIndex);
      }
      notifyListeners();
    }
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  Future<bool> checkout() async {
    if (_items.isEmpty) return false;

    final orderData = {
      'totalAmount': totalAmount,
      'status': 'PENDING',
      'orderItems': _items.map((item) => {
        'productId': item.product.id,
        'quantity': item.quantity,
        'price': item.product.price,
        'notes': item.notes ?? '',
      }).toList(),
      'payments': [
        {
          'amount': totalAmount,
          'paymentMethod': _paymentMethod,
          'status': 'SUCCESS',
        }
      ]
    };

    bool success = await _apiService.submitOrder(orderData);
    
    if (!success) {
      // Offline fallback: save simple record (needs deeper schema for items in production)
      await DatabaseHelper.instance.insertOfflineOrder({
        'local_id': const Uuid().v4(),
        'total_amount': totalAmount,
        'status': 'PENDING',
        'sync_status': 'PENDING',
        'created_at': DateTime.now().toIso8601String()
      });
    }

    clearCart();
    return true;
  }
}
