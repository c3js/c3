set :source, 'docs'
set :haml, { :format => :html5 }
set :css_dir, 'css'
set :js_dir, 'js'
set :images_dir, 'img'

configure :build do
  activate :asset_hash, :ignore => %r{^js/ace/.*}
end
