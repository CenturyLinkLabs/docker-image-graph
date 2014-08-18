#! /bin/bash

if [ -z "$PORT"]; then
  ruby ./image-graph-cmd.rb
else
  ruby ./image-graph-web.rb
fi
