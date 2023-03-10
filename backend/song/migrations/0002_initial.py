# Generated by Django 4.1.7 on 2023-02-21 15:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user', '0001_initial'),
        ('song', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='artists',
            field=models.ManyToManyField(related_name='songs', to='user.artist'),
        ),
        migrations.AddField(
            model_name='song',
            name='genres',
            field=models.ManyToManyField(related_name='songs', to='song.genre'),
        ),
        migrations.AddField(
            model_name='song',
            name='playlists',
            field=models.ManyToManyField(blank=True, related_name='songs', to='song.playlist'),
        ),
        migrations.AddField(
            model_name='playlist',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playlists', to='user.customer'),
        ),
    ]
