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
  String _selectedCategory = "Semua";
  String _searchQuery = "";

  @override
  void initState() {
    super.initState();
    _productsFuture = _apiService.fetchProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.all(3),
              child: Image.asset(
                'assets/images/logo.png',
                height: 32,
                width: 32,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.coffee, color: Colors.amber, size: 28),
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Kopi Tabo', style: TextStyle(fontWeight: FontWeight.extrabold, fontSize: 18, color: Colors.white)),
                Text('Cashier POS Portal', style: TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w500)),
              ],
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0F172A),
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.amber),
            tooltip: 'Refresh Menu',
            onPressed: () {
              setState(() {
                _productsFuture = _apiService.fetchProducts();
              });
            },
          ),
          const SizedBox(width: 8),
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
                  return const Center(
                    child: CircularProgressIndicator(color: Colors.amber),
                  );
                } else if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.wifi_off_rounded, size: 56, color: Colors.slate.shade400),
                        const SizedBox(height: 12),
                        Text(
                          'Server tidak dapat terhubung.',
                          style: TextStyle(color: Colors.slate.shade700, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${snapshot.error}',
                          style: TextStyle(color: Colors.red.shade400, fontSize: 12),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(
                    child: Text('Belum ada menu produk tersedia.'),
                  );
                }

                final allProducts = snapshot.data!;

                // Extract unique category names
                final categoriesSet = <String>{"Semua"};
                for (var p in allProducts) {
                  final catName = p.category?.name ?? p.categoryId;
                  if (catName.isNotEmpty) categoriesSet.add(catName);
                }
                final categoriesList = categoriesSet.toList();

                // Filter products based on search query and selected category
                final filteredProducts = allProducts.filter((p) {
                  final matchesSearch = p.name.toLowerCase().contains(_searchQuery.toLowerCase());
                  final catName = p.category?.name ?? p.categoryId;
                  final matchesCat = _selectedCategory == "Semua" || catName == _selectedCategory;
                  return matchesSearch && matchesCat;
                }).toList();

                return Column(
                  children: [
                    // Search & Category Filter Header Bar
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      color: Colors.white,
                      border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
                      child: Column(
                        children: [
                          // Search Input Box
                          Container(
                            height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: TextField(
                              onChanged: (val) => setState(() => _searchQuery = val),
                              style: const TextStyle(fontSize: 13),
                              decoration: const InputDecoration(
                                hintText: 'Cari nama menu...',
                                hintStyle: TextStyle(fontSize: 13, color: Colors.slate),
                                prefixIcon: Icon(Icons.search_rounded, size: 20, color: Colors.slate),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(vertical: 10),
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Category Chips Bar
                          SizedBox(
                            height: 32,
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              itemCount: categoriesList.length,
                              separatorBuilder: (context, index) => const SizedBox(width: 8),
                              itemBuilder: (context, index) {
                                final cat = categoriesList[index];
                                final isSelected = cat == _selectedCategory;
                                return ChoiceChip(
                                  label: Text(cat),
                                  selected: isSelected,
                                  onSelected: (selected) {
                                    if (selected) {
                                      setState(() => _selectedCategory = cat);
                                    }
                                  },
                                  selectedColor: Colors.amber.shade600,
                                  backgroundColor: const Color(0xFFF1F5F9),
                                  labelStyle: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                    color: isSelected ? Colors.white : const Color(0xFF475569),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  visualDensity: VisualDensity.compact,
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Compact Product Grid Layout
                    Expanded(
                      child: filteredProducts.isEmpty
                          ? Center(
                              child: Text(
                                'Tidak ada menu ditemukan',
                                style: TextStyle(color: Colors.slate.shade500, fontSize: 14),
                              ),
                            )
                          : GridView.builder(
                              padding: const EdgeInsets.all(12),
                              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                                maxCrossAxisExtent: 165, // Compact card grid width
                                childAspectRatio: 0.82,  // Balanced height/width ratio
                                crossAxisSpacing: 10,
                                mainAxisSpacing: 10,
                              ),
                              itemCount: filteredProducts.length,
                              itemBuilder: (context, index) {
                                final product = filteredProducts[index];
                                return ProductCard(
                                  product: product,
                                  onTap: () {
                                    context.read<CartProvider>().addToCart(product);
                                  },
                                );
                              },
                            ),
                    ),
                  ],
                );
              },
            ),
          ),

          // Sidebar Keranjang (Cart)
          const CartSidebar(),
        ],
      ),
    );
  }
}
