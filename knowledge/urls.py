from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static
from front import views
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'knowledge.views.home', name='home'),
    # url(r'^knowledge/', include('knowledge.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^$', views.index),
    url(r'^notebook/$', views.list_notebook),
    url(r'^note/$', views.show_note),
    url(r'^auth/', include('oauth.urls')),
                       
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
