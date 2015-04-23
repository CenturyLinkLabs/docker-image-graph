FROM alpine:3.1

MAINTAINER CenturyLink Labs <clt-labs-futuretech@centurylink.com>
ENTRYPOINT ["/usr/src/app/image-graph.sh"]
CMD [""]

RUN apk update && apk add ruby-dev graphviz ttf-ubuntu-font-family ca-certificates
RUN gem install --no-rdoc --no-ri docker-api sinatra
RUN dot -c

ADD . /usr/src/app/
WORKDIR /usr/src/app/
