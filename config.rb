helpers do
  def js_as_plain(id)
    raise ArgumentError unless id =~ /\A[a-zA-Z0-9_-]+\z/

    base = File.expand_path('docs/js/samples', __dir__)
    path = File.expand_path("#{id}.js", base)
    raise ArgumentError unless path.start_with?(base + File::SEPARATOR)

    File.read(path)
  end
  def data_as_plain(name)
    raise ArgumentError unless name =~ /\A[a-zA-Z0-9._-]+\z/

    base = File.expand_path('docs/data', __dir__)
    path = File.expand_path(name, base)
    raise ArgumentError unless path.start_with?(base + File::SEPARATOR)

    File.read(path)
  end
  def css_as_plain(name)
    raise ArgumentError unless name =~ /\A[a-zA-Z0-9._-]+\z/

    base = File.expand_path('docs/css/samples', __dir__)
    path = File.expand_path(name, base)
    raise ArgumentError unless path.start_with?(base + File::SEPARATOR)

    File.read(path)
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
