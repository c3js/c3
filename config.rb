helpers do
  def js_as_plain(id)
    f = open("docs/js/samples/" + id + ".js")
    js = f.read
    f.close
    js
  end
  def data_as_plain(name)
    f = open("docs/data/" + name)
    data = f.read
    f.close
    data
  end
  def css_as_plain(name)
    f = open("docs/css/samples/" + name)
    css = f.read
    f.close
    css
  end
  def get_css_name(path)
    path.gsub('.html', '')
  end
end

set :source, 'docs'
set :haml, { :ugly => true, :format => :html5 }
set :css_dir, 'css'
set :js_dir, 'js'
set :images_dir, 'img'

configure :build do
  activate :asset_hash, :ignore => %r{^js/ace/.*}
end
