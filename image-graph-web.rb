require 'sinatra'
require 'docker'

set :port, ENV['PORT']
set :bind, '0.0.0.0'

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/images.json' do

  images = Docker::Image.all(all: 1)

  nodes = images.each_with_object({}) do |image, memo|
    memo[image.id] = {
        id: image.id,
        name: image.id[0..11],
        parent_id: image.info['ParentId'],
        size: image.size,
        command: image.cmd,
        tag: image.tags,
        children: []
    }
  end

  nodes.each do |_, node|
    next if node[:parent_id] == ''
    nodes[node[:parent_id]][:children] << node
  end

  root = nodes.find do |_, node|
    node[:parent_id] == ''
  end

  root[1].to_json
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
