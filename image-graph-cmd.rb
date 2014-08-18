#! /usr/local/bin/ruby
require 'open3'
require 'docker'

dot_file = []
dot_file << 'digraph docker {'

Docker::Image.all(all: true).each do |image|

  id = image.id[0..11]
  tags = image.info['RepoTags'].reject { |t| t == '<none>:<none>' }.join('\n')
  parent_id = image.info['ParentId'][0..11]

  if parent_id.empty?
    dot_file << "base -> \"#{id}\" [style=invis]"
  else
    dot_file << "\"#{parent_id}\" -> \"#{id}\""
  end

  unless tags.empty?
    dot_file << "\"#{id}\" [label=\"#{id}\\n#{tags}\",shape=box,fillcolor=\"paleturquoise\",style=\"filled,rounded\"];"
  end
end

dot_file << 'base [style=invisible]'
dot_file << '}'

Open3.popen3('/usr/bin/dot -Tpng') do |stdin, stdout, stderr|
  stdin.puts(dot_file.join("\n"))
  stdin.close
  STDOUT.write stdout.read
end
