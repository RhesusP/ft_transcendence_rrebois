# Generated by Django 5.0.4 on 2024-05-27 12:16

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userStats', '0003_alter_user_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='firstName',
        ),
        migrations.AlterField(
            model_name='user',
            name='friends',
            field=models.ManyToManyField(blank=True, null=True, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='user',
            name='image',
            field=models.ImageField(default='default_pp.jpg', upload_to='./profile_pics/'),
        ),
    ]