// KDIH Admin App - Gallery Screen

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/responsive.dart';
import '../../core/constants/app_constants.dart';
import '../../core/services/api_service.dart';
import '../../widgets/common/loading_widget.dart';

class GalleryScreen extends StatefulWidget {
  const GalleryScreen({super.key});
  
  @override
  State<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<GalleryScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _images = [];
  bool _isLoading = true;
  String? _error;
  String _filter = 'all';
  
  @override
  void initState() {
    super.initState();
    _loadGallery();
  }
  
  Future<void> _loadGallery() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final response = await _api.getGallery();
      setState(() {
        _images = response.data['images'] ?? response.data ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final isTablet = Responsive.isTabletOrLarger(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gallery'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadGallery),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddImageDialog(context),
        icon: const Icon(Icons.add_photo_alternate),
        label: const Text('Add Image'),
      ),
      body: Column(
        children: [
          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _buildFilterChip('All', 'all'),
                _buildFilterChip('Events', 'events'),
                _buildFilterChip('Training', 'training'),
                _buildFilterChip('Coworking', 'coworking'),
                _buildFilterChip('Other', 'other'),
              ],
            ),
          ),
          
          // Gallery grid
          Expanded(
            child: _isLoading
                ? const LoadingWidget(message: 'Loading gallery...')
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.error_outline, size: 48, color: AppTheme.danger),
                            const SizedBox(height: 16),
                            Text(_error!, style: TextStyle(color: AppTheme.textMuted)),
                            const SizedBox(height: 16),
                            ElevatedButton(onPressed: _loadGallery, child: const Text('Retry')),
                          ],
                        ),
                      )
                    : _images.isEmpty
                        ? EmptyStateWidget(
                            icon: Icons.photo_library_outlined,
                            title: 'No images yet',
                            subtitle: 'Upload images to the gallery',
                          )
                        : RefreshIndicator(
                            onRefresh: _loadGallery,
                            child: GridView.builder(
                              padding: const EdgeInsets.all(16),
                              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: isTablet ? 4 : 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                              itemCount: _filteredImages.length,
                              itemBuilder: (context, index) => _buildImageCard(_filteredImages[index]),
                            ),
                          ),
          ),
        ],
      ),
    );
  }
  
  List<dynamic> get _filteredImages {
    if (_filter == 'all') return _images;
    return _images.where((img) => 
      (img['category'] ?? '').toString().toLowerCase() == _filter
    ).toList();
  }
  
  Widget _buildFilterChip(String label, String value) {
    final isSelected = _filter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) => setState(() { _filter = selected ? value : 'all'; }),
        selectedColor: AppTheme.accent.withValues(alpha: 0.2),
        checkmarkColor: AppTheme.accent,
        labelStyle: TextStyle(color: isSelected ? AppTheme.accent : AppTheme.textMuted),
      ),
    );
  }
  
  Widget _buildImageCard(dynamic image) {
    final imageUrl = image['image_url'] ?? image['url'] ?? '';
    final title = image['title'] ?? 'Image';
    
    return GestureDetector(
      onTap: () => _showImagePreview(image),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.divider),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Stack(
            fit: StackFit.expand,
            children: [
              CachedNetworkImage(
                imageUrl: imageUrl.startsWith('http') 
                    ? imageUrl 
                    : '${AppConstants.baseUrl.replaceAll('/api', '')}$imageUrl',
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: AppTheme.primary,
                  child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                ),
                errorWidget: (context, url, error) => Container(
                  color: AppTheme.primary,
                  child: const Icon(Icons.broken_image, color: AppTheme.textMuted),
                ),
              ),
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black.withValues(alpha: 0.7)],
                    ),
                  ),
                  child: Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  void _showImagePreview(dynamic image) {
    final imageUrl = image['image_url'] ?? image['url'] ?? '';
    final fullUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : '${AppConstants.baseUrl.replaceAll('/api', '')}$imageUrl';
    
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Stack(
          children: [
            InteractiveViewer(
              child: CachedNetworkImage(imageUrl: fullUrl, fit: BoxFit.contain),
            ),
            Positioned(
              top: 8,
              right: 8,
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.delete, color: AppTheme.danger),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _confirmDelete(image);
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  void _showAddImageDialog(BuildContext context) {
    final urlController = TextEditingController();
    final titleController = TextEditingController();
    String category = 'events';
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom,
                left: 24, right: 24, top: 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Add Image', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                  const SizedBox(height: 24),
                  TextField(
                    controller: titleController,
                    decoration: const InputDecoration(labelText: 'Title', prefixIcon: Icon(Icons.title)),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: urlController,
                    decoration: const InputDecoration(labelText: 'Image URL', prefixIcon: Icon(Icons.link)),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: category,
                    decoration: const InputDecoration(labelText: 'Category', prefixIcon: Icon(Icons.category)),
                    items: ['events', 'training', 'coworking', 'other']
                        .map((e) => DropdownMenuItem(value: e, child: Text(e[0].toUpperCase() + e.substring(1))))
                        .toList(),
                    onChanged: (value) {
                      setModalState(() { category = value ?? 'events'; });
                    },
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (urlController.text.isEmpty) return;
                        try {
                          await _api.createGalleryItem({
                            'title': titleController.text,
                            'image_url': urlController.text,
                            'category': category,
                          });
                          if (ctx.mounted) Navigator.pop(ctx);
                          _loadGallery();
                        } catch (e) {
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.danger),
                            );
                          }
                        }
                      },
                      child: const Text('Add Image'),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        );
      },
    );
  }
  
  void _confirmDelete(dynamic image) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardBackground,
        title: const Text('Delete Image'),
        content: const Text('Are you sure you want to delete this image?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await _api.deleteGalleryItem(image['id']);
                _loadGallery();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.danger),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
