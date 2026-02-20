from django.core.management.base import BaseCommand
from complaints.models import Category


class Command(BaseCommand):
    help = 'Load initial complaint categories with department mappings'

    def handle(self, *args, **kwargs):
        categories = [
            {
                'name': 'Roads & Infrastructure',
                'description': 'Potholes, damaged roads, street lights, footpaths',
                'icon': '🛣️',
                'color': '#EF4444',
                'department': 'Public Works Department'
            },
            {
                'name': 'Water Supply',
                'description': 'Water shortage, leakage, quality issues',
                'icon': '💧',
                'color': '#3B82F6',
                'department': 'Water Department'
            },
            {
                'name': 'Electricity',
                'description': 'Power outages, damaged poles, street light issues',
                'icon': '⚡',
                'color': '#F59E0B',
                'department': 'Electricity Department'
            },
            {
                'name': 'Sanitation & Waste',
                'description': 'Garbage collection, drainage, cleanliness',
                'icon': '🗑️',
                'color': '#10B981',
                'department': 'Sanitation Department'
            },
            {
                'name': 'Public Safety',
                'description': 'Crime, traffic violations, safety concerns',
                'icon': '🚨',
                'color': '#DC2626',
                'department': 'Public Safety Department'
            },
            {
                'name': 'Parks & Recreation',
                'description': 'Park maintenance, playground equipment',
                'icon': '🌳',
                'color': '#059669',
                'department': 'Parks & Recreation Department'
            },
            {
                'name': 'Building & Construction',
                'description': 'Illegal construction, building violations',
                'icon': '🏗️',
                'color': '#7C3AED',
                'department': 'Urban Development Department'
            },
            {
                'name': 'Other',
                'description': 'Other municipal issues',
                'icon': '📋',
                'color': '#6B7280',
                'department': 'General Administration'
            },
        ]

        for cat_data in categories:
            category, created = Category.objects.update_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'icon': cat_data['icon'],
                    'color': cat_data['color'],
                    'department': cat_data['department'],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created category: {category.name} → {category.department}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'✓ Updated category: {category.name} → {category.department}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully loaded {len(categories)} categories with department mappings'))
