import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../providers/cart_provider.dart';
import '../widgets/product_card.dart';
import '../widgets/cart_sidebar.dart';

class PosScreen extends StatefulWidget {
  const PosScreen({super.key});

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    _productsFuture = _apiService.fetchProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.all(2),
              child: Image.asset('assets/images/logo.png', height: 36, width: 36, fit: BoxFit.contain),
            ),
            const SizedBox(width: 12),
            const Text('Kopi Tabo POS', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
        backgroundColor: Theme.of(context).primaryColor,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              setState(() {
                _productsFuture = _apiService.fetchProducts();
              });
            },
          )
        ],
      ),
      body: Row(
        children: [
          // Main Product Area
          Expanded(
            child: FutureBuilder<List<Product>>(
              future: _productsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.wifi_off, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        Text('Server unreachable. Offline mode active?', style: TextStyle(color: Colors.grey.shade600, fontSize: 18)),
                        Text('${snapshot.error}', style: TextStyle(color: Colors.red.shade300, fontSize: 12), textAlign: TextAlign.center),
                      ]
                    )
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('No products available.'));
                }

                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 0.85,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    final product = snapshot.data![index];
                    return ProductCard(
                      product: product,
                      onTap: () {
                        context.read<CartProvider>().addToCart(product);
                      },
                    );
                  },
                );
              },
            ),
          ),
          // Sidebar
          const CartSidebar(),
        ],
      ),
    );
  }
}
