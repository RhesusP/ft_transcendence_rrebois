# Generated by Django 5.0.4 on 2024-07-18 15:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matchs', '0003_alter_match_winner'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='count',
            field=models.IntegerField(default=2),
        ),
    ]