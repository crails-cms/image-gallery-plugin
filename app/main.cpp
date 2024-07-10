#include <string>
#include <iostream>

using namespace std;

extern unsigned char gallery_plugin_application_css[];
extern unsigned int  gallery_plugin_application_css_len;
extern unsigned char gallery_plugin_admin_js[];
extern unsigned int  gallery_plugin_admin_js_len;

extern "C"
{
  void initialize()
  {
  }

  void install()
  {
  }

  void uninstall()
  {
  }

  std::string_view plugin_stylesheet()
  {
    return std::string_view(
      reinterpret_cast<const char*>(gallery_plugin_application_css),
      gallery_plugin_application_css_len
    );
  }

  std::string_view plugin_admin_javascript()
  {
    return std::string_view(
      reinterpret_cast<const char*>(gallery_plugin_admin_js),
      gallery_plugin_admin_js_len
    );
  }
}

