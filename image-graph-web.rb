require 'sinatra'
require 'docker'

set :port, ENV['PORT']
set :bind, '0.0.0.0'

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/images.json' do

  Docker::Image.all(all: 1).map do |image|
    label = "#{image.short_id} &mdash; #{image.size} MB<span class=\"tags\">#{image.tags}</span>"

    [ { v: image.id, f: label }, image.parent_id, image.cmd, ]
  end.to_json
end

delete '/images/:image_id.json' do
  image = Docker::Image.get(params['image_id'])

  begin
    image.remove()
    "true"
  rescue => ex
    "false"
  end
end

class Docker::Image

  NOP_PREFIX = '#(nop) '

  def short_id
    id[0..11]
  end

  def parent_id
    info['ParentId']
  end

  def size
    info['VirtualSize'] / 1024 / 1024
  end

  def tags
    info['RepoTags'].reject { |t| t == '<none>:<none>' }.join(', ')
  end

  def cmd
    cmd = json['ContainerConfig']['Cmd']

    if cmd && cmd.size == 3
      cmd = cmd.last

      if cmd.start_with?(NOP_PREFIX)
        cmd = cmd.split(NOP_PREFIX).last
      else
        cmd = "RUN #{cmd}".squeeze(' ')
      end
    end

    cmd
  rescue => ex
    ''
  end
end
