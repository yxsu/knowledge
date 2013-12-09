from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('front.views',
    # Examples:
    # url(r'^$', 'knowledge.views.home', name='home'),
    # url(r'^knowledge/', include('knowledge.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'index'),
    url(r'^notebook/$', 'list_notebook'),
    url(r'^note/new/$', 'new_note'),
    url(r'^note/([\w_]{6,10})/$', 'show_note'),
                       
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += patterns('',
    url(r'^auth/', include('oauth.urls')), 
)