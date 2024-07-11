# Generated by Django 5.0.4 on 2024-07-11 15:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matchs', '0002_alter_match_score'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlayerScore',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.IntegerField(default=0)),
            ],
        ),
        migrations.RemoveField(
            model_name='match',
            name='score',
        ),
        migrations.AddField(
            model_name='match',
            name='is_pong',
            field=models.BooleanField(default=True),
        ),
    ]
