#! /bin/sh

if [ -z "$PORT" ]; then
  ruby ./image-graph-cmd.rb | dot -Tpng
else
  ruby ./image-graph-web.rb
fi
