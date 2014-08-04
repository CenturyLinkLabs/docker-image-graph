FROM centurylink/ruby-base:2.1.2

MAINTAINER CenturyLink Labs <clt-labs-futuretech@centurylink.com>

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y graphviz
RUN gem install docker-api

ADD image-graph.rb /usr/src/app/image-graph.rb
WORKDIR /usr/src/app
RUN chmod +x image-graph.rb

CMD [""]
ENTRYPOINT ["./image-graph.rb"]
