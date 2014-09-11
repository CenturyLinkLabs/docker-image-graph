(function() {
  docker_image_graph = {

    stack: function(selection) {
      var switchChildren = function(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
      };

      var eventHandlers = {
          bar: {
            mouseover: function(_,el) { el.attr("class", 'hover'); },
            mouseleave: function(_,el) { el.attr("class", color) },
            click: function(d, _) {
              switchChildren(d);
              graph.update(d);
            }
          },
          name: {
            click: function(d,_) {
              d.expanded = (d.expanded) ? false : true;
              graph.update(root);
            }
          }
        },
        options = {
          margin: {top: 0, right: 0, bottom: 0, left: 0},
          width: 1280,
          barHeight: 45,
          barWidth: 600,
          duration: 400
        },
        element = null,
        root = null;

      var tree = d3.layout.tree().nodeSize([0, 24]);

      var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

      function color(d) {
        return d._children ? "collapsed" : d.children ? "branch" : "leaf";
      }

      function initSVG() {
        var buildSVG = function(el) {
          return el.append("svg")
            .attr("width", options.width + options.margin.left + options.margin.right)
            .append("g")
            .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");
        }

        return (element.select("svg").empty()) ? buildSVG(element) : element.select("svg g");
      };


      function graph(selection) {
        var selection = (selection) ? selection : "body";

        element = d3.select(selection);
        return graph;
      };

      graph.canvas = function(opts) {
        var newMargin = $.extend({}, options.margin, opts.margin);

        options = $.extend(options, opts);
        options.margin = newMargin;
        return graph;
      };

      graph.data = function(url) {
        d3.json(url, function(error, flare) {
          flare.x0 = 0;
          flare.y0 = 0;
          graph.update(root = flare);
        });
        return graph;
      };

      graph.update = function(source) {
        source = (source) ? source : root;

        svg = initSVG();

        // Compute the flattened node list. TODO use d3.layout.hierarchy.
        var nodes = tree.nodes(root);

        var height = Math.max(500, nodes.length * options.barHeight + options.margin.top + options.margin.bottom);

        d3.select("svg").transition()
          .duration(options.duration)
          .attr("height", height);

        d3.select(self.frameElement).transition()
          .duration(options.duration)
          .style("height", height + "px");

        // Compute the "layout".
        var expandedCount = 0;
        nodes.forEach(function(n, i) {
          n.x = i * options.barHeight + (expandedCount * options.barHeight);
          if (n.expanded) expandedCount ++;
        });

        // Update the nodes…
        var node = svg.selectAll("g.node")
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

        var nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
          .style("opacity", 1e-6);

        // Enter any new nodes at the parent's previous position.
        nodeEnter.append("rect")
          .attr("y", -options.barHeight / 2)
          .attr("height", function(d) { return ((d.expanded) ? options.barHeight * 2 : options.barHeight) - 4 })
          .attr("width", options.barWidth )
          .attr("class", color)
          .on('mouseover', function(d) { eventHandlers.bar.mouseover(d, d3.select(this)); })
          .on('mouseleave', function(d) { eventHandlers.bar.mouseleave(d, d3.select(this)); })
          .on('click', function(d) { eventHandlers.bar.click(d, d3.select(this)); });

        nodeEnter.append("text")
          .attr("x", options.barWidth)
          .attr("dx", -4)
          .attr("dy", 2.5)
          .attr("text-anchor", "end")
          .text(function(d) { return " ( " + d.size + " MB )" });

        nodeEnter.append("text")
          .attr("dy", 2.5)
          .attr("dx", 5.5)
          .text(function(d) { return d.name + " : " + d.tag; })
          .on('click', function(d) { eventHandlers.name.click(d, d3.select(this)); });

        // Run Command node
        nodeEnter.append("rect")
          .attr("id", "cmd")
          .attr("y", options.barHeight / 2 )
          .attr("height", 0)
          .attr("width", options.barWidth )
          .attr("class", 'command');

        nodeEnter.append("text")
          .attr("id", "cmd_text")
          .attr("dy", options.barHeight)
          .attr("dx", 15.0)
          .style("opacity", 0)
          .text(function(d) { return "> " + d.command; });

        // Transition nodes to their new position
        node.transition()
          .duration(options.duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
          .style("opacity", 1.0)
          .select("rect")
          .attr("height", function(d) { return ((d.expanded) ? options.barHeight * 2 : options.barHeight) - 4 })
          .attr("class", color);

        node.transition()
          .duration(options.duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
          .style("opacity", 1)
          .select("#cmd")
          .attr("height", function(d) { return (d.expanded) ? options.barHeight-4 : 0 });

        node.transition()
          .duration(options.duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
          .style("opacity", 1)
          .select("#cmd_text")
          .style("opacity", function(d) { return (d.expanded) ? 1 : 0 })

        // Transition exiting nodes to the parent's new position.
        node.exit().transition()
          .duration(options.duration)
          .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
          .style("opacity", 1e-6)
          .remove();

        // Update the links…
        var link = svg.selectAll("path.link")
          .data(tree.links(nodes), function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
          .attr("class", "link")
          .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
          })
          .transition()
          .duration(options.duration)
          .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
          .duration(options.duration)
          .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
          .duration(options.duration)
          .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
          })
          .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });

        return graph;
      };

      graph.clear = function() {
        return graph;
      };

      graph.styles = function() {
      };

      graph.on = function(el, action, fn) {
        eventHandlers[el][action] = fn;
        return graph;
      };

      return graph(selection);
    }
  }
})();
