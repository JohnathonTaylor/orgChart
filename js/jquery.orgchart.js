var _typeof =
  "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
    ? function(a) {
        return typeof a;
      }
    : function(a) {
        return a &&
          "function" == typeof Symbol &&
          a.constructor === Symbol &&
          a !== Symbol.prototype
          ? "symbol"
          : typeof a;
      };
(function(a) {
  "object" === ("undefined" == typeof module ? "undefined" : _typeof(module)) &&
  "object" === _typeof(module.exports)
    ? a(require("jquery"), window, document)
    : a(jQuery, window, document);
})(function(a, b, c) {
  var f = function(g, h) {
    (this.$chartContainer = a(g)),
      (this.opts = h),
      (this.defaultOptions = {
        nodeTitle: "name",
        nodeId: "id",
        toggleSiblingsResp: !1,
        visibleLevel: 999,
        chartClass: "",
        exportButton: !1,
        exportFilename: "OrgChart",
        exportFileextension: "png",
        parentNodeSymbol: "fa-users",
        draggable: !1,
        direction: "t2b",
        pan: !1,
        zoom: !1,
        zoominLimit: 7,
        zoomoutLimit: 0.5
      });
  };
  (f.prototype = {
    init: function init(g) {
      var h = this;
      this.options = a.extend({}, this.defaultOptions, this.opts, g);
      var k = this.$chartContainer;
      this.$chart && this.$chart.remove();
      var l = this.options.data,
        m = (this.$chart = a("<div>", {
          data: { options: this.options },
          class:
            "orgchart" +
            ("" === this.options.chartClass
              ? ""
              : " " + this.options.chartClass) +
            ("t2b" === this.options.direction
              ? ""
              : " " + this.options.direction),
          click: function click(n) {
            a(n.target).closest(".node").length ||
              m.find(".node.focused").removeClass("focused");
          }
        }));
      return (
        "undefined" != typeof MutationObserver && this.triggerInitEvent(),
        "object" === a.type(l)
          ? l instanceof a
            ? this.buildHierarchy(
                m,
                this.buildJsonDS(l.children()),
                0,
                this.options
              )
            : this.buildHierarchy(
                m,
                this.options.ajaxURL ? l : this.attachRel(l, "00")
              )
          : (m.append('<i class="fa fa-circle-o-notch fa-spin spinner"></i>'),
            a
              .ajax({ url: l, dataType: "json" })
              .done(function(n) {
                h.buildHierarchy(
                  m,
                  h.options.ajaxURL ? n : h.attachRel(n, "00"),
                  0,
                  h.options
                );
              })
              .fail(function(n, o, p) {
                console.log(p);
              })
              .always(function() {
                m.children(".spinner").remove();
              })),
        k.append(m),
        this.options.exportButton &&
          !k.find(".oc-export-btn").length &&
          this.attachExportButton(),
        this.options.pan && this.bindPan(),
        this.options.zoom && this.bindZoom(),
        this
      );
    },
    triggerInitEvent: function triggerInitEvent() {
      var g = this,
        h = new MutationObserver(function(k) {
          h.disconnect();
          initTime: for (var l = 0; l < k.length; l++)
            for (var m = 0; m < k[l].addedNodes.length; m++)
              if (
                k[l].addedNodes[m].classList.contains("orgchart") &&
                g.options.initCompleted &&
                "function" == typeof g.options.initCompleted
              ) {
                g.options.initCompleted(g.$chart);
                var n = a.Event("init.orgchart");
                g.$chart.trigger(n);
                break initTime;
              }
        });
      h.observe(this.$chartContainer[0], { childList: !0 });
    },
    attachExportButton: function attachExportButton() {
      var g = this,
        h = a("<button>", {
          class:
            "oc-export-btn" +
            ("" === this.options.chartClass
              ? ""
              : " " + this.options.chartClass),
          text: "Export",
          click: function click(k) {
            k.preventDefault(), g.export();
          }
        });
      this.$chartContainer.append(h);
    },
    setOptions: function setOptions(g, h) {
      return (
        "string" == typeof g &&
          ("pan" === g && (h ? this.bindPan() : this.unbindPan()),
          "zoom" === g && (h ? this.bindZoom() : this.unbindZoom())),
        "object" === ("undefined" == typeof g ? "undefined" : _typeof(g)) &&
          (g.data
            ? this.init(g)
            : ("undefined" != typeof g.pan &&
                (g.pan ? this.bindPan() : this.unbindPan()),
              "undefined" != typeof g.zoom &&
                (g.zoom ? this.bindZoom() : this.unbindZoom()))),
        this
      );
    },
    panStartHandler: function panStartHandler(g) {
      var h = a(g.delegateTarget);
      if (
        a(g.target).closest(".node").length ||
        (g.touches && 1 < g.touches.length)
      )
        return void h.data("panning", !1);
      h.css("cursor", "move").data("panning", !0);
      var k = 0,
        l = 0,
        m = h.css("transform");
      if ("none" !== m) {
        var n = m.split(",");
        -1 === m.indexOf("3d")
          ? ((k = parseInt(n[4])), (l = parseInt(n[5])))
          : ((k = parseInt(n[12])), (l = parseInt(n[13])));
      }
      var o = 0,
        p = 0;
      if (!g.targetTouches) (o = g.pageX - k), (p = g.pageY - l);
      else if (1 === g.targetTouches.length)
        (o = g.targetTouches[0].pageX - k), (p = g.targetTouches[0].pageY - l);
      else if (1 < g.targetTouches.length) return;
      h.on("mousemove touchmove", function(q) {
        if (h.data("panning")) {
          var r = 0,
            s = 0;
          if (!q.targetTouches) (r = q.pageX - o), (s = q.pageY - p);
          else if (1 === q.targetTouches.length)
            (r = q.targetTouches[0].pageX - o),
              (s = q.targetTouches[0].pageY - p);
          else if (1 < q.targetTouches.length) return;
          var t = h.css("transform");
          if ("none" === t)
            -1 === t.indexOf("3d")
              ? h.css("transform", "matrix(1, 0, 0, 1, " + r + ", " + s + ")")
              : h.css(
                  "transform",
                  "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, " +
                    r +
                    ", " +
                    s +
                    ", 0, 1)"
                );
          else {
            var u = t.split(",");
            -1 === t.indexOf("3d")
              ? ((u[4] = " " + r), (u[5] = " " + s + ")"))
              : ((u[12] = " " + r), (u[13] = " " + s)),
              h.css("transform", u.join(","));
          }
        }
      });
    },
    panEndHandler: function panEndHandler(g) {
      g.data.chart.data("panning") &&
        g.data.chart
          .data("panning", !1)
          .css("cursor", "default")
          .off("mousemove");
    },
    bindPan: function bindPan() {
      this.$chartContainer.css("overflow", "hidden"),
        this.$chart.on("mousedown touchstart", this.panStartHandler),
        a(c).on("mouseup touchend", { chart: this.$chart }, this.panEndHandler);
    },
    unbindPan: function unbindPan() {
      this.$chartContainer.css("overflow", "auto"),
        this.$chart.off("mousedown touchstart", this.panStartHandler),
        a(c).off("mouseup touchend", this.panEndHandler);
    },
    zoomWheelHandler: function zoomWheelHandler(g) {
      var h = g.data.oc;
      g.preventDefault();
      var k = 1 + (0 < g.originalEvent.deltaY ? -0.2 : 0.2);
      h.setChartScale(h.$chart, k);
    },
    zoomStartHandler: function zoomStartHandler(g) {
      if (g.touches && 2 === g.touches.length) {
        var h = g.data.oc;
        h.$chart.data("pinching", !0);
        var k = h.getPinchDist(g);
        h.$chart.data("pinchDistStart", k);
      }
    },
    zoomingHandler: function zoomingHandler(g) {
      var h = g.data.oc;
      if (h.$chart.data("pinching")) {
        var k = h.getPinchDist(g);
        h.$chart.data("pinchDistEnd", k);
      }
    },
    zoomEndHandler: function zoomEndHandler(g) {
      var h = g.data.oc;
      if (h.$chart.data("pinching")) {
        h.$chart.data("pinching", !1);
        var k = h.$chart.data("pinchDistEnd") - h.$chart.data("pinchDistStart");
        0 < k
          ? h.setChartScale(h.$chart, 1.2)
          : 0 > k && h.setChartScale(h.$chart, 0.8);
      }
    },
    bindZoom: function bindZoom() {
      this.$chartContainer.on("wheel", { oc: this }, this.zoomWheelHandler),
        this.$chartContainer.on(
          "touchstart",
          { oc: this },
          this.zoomStartHandler
        ),
        a(c).on("touchmove", { oc: this }, this.zoomingHandler),
        a(c).on("touchend", { oc: this }, this.zoomEndHandler);
    },
    unbindZoom: function unbindZoom() {
      this.$chartContainer.off("wheel", this.zoomWheelHandler),
        this.$chartContainer.off("touchstart", this.zoomStartHandler),
        a(c).off("touchmove", this.zoomingHandler),
        a(c).off("touchend", this.zoomEndHandler);
    },
    getPinchDist: function getPinchDist(g) {
      return Math.sqrt(
        (g.touches[0].clientX - g.touches[1].clientX) *
          (g.touches[0].clientX - g.touches[1].clientX) +
          (g.touches[0].clientY - g.touches[1].clientY) *
            (g.touches[0].clientY - g.touches[1].clientY)
      );
    },
    setChartScale: function setChartScale(g, h) {
      var k = g.data("options"),
        l = g.css("transform"),
        m = "",
        n = 1;
      "none" === l
        ? g.css("transform", "scale(" + h + "," + h + ")")
        : ((m = l.split(",")),
          -1 === l.indexOf("3d")
            ? ((n = Math.abs(b.parseFloat(m[3]) * h)),
              n > k.zoomoutLimit &&
                n < k.zoominLimit &&
                g.css("transform", l + " scale(" + h + "," + h + ")"))
            : ((n = Math.abs(b.parseFloat(m[1]) * h)),
              n > k.zoomoutLimit &&
                n < k.zoominLimit &&
                g.css("transform", l + " scale3d(" + h + "," + h + ", 1)")));
    },
    buildJsonDS: function buildJsonDS(g) {
      var h = this,
        k = {
          name: g
            .contents()
            .eq(0)
            .text()
            .trim(),
          relationship:
            (g
              .parent()
              .parent()
              .is("li")
              ? "1"
              : "0") +
            (g.siblings("li").length ? 1 : 0) +
            (g.children("ul").length ? 1 : 0)
        };
      return (
        a.each(g.data(), function(l, m) {
          k[l] = m;
        }),
        g
          .children("ul")
          .children()
          .each(function() {
            k.children || (k.children = []),
              k.children.push(h.buildJsonDS(a(this)));
          }),
        k
      );
    },
    attachRel: function attachRel(g, h) {
      var k = this;
      return (
        (g.relationship = h + (g.children && 0 < g.children.length ? 1 : 0)),
        g.children &&
          g.children.forEach(function(l) {
            k.attachRel(l, "1" + (1 < g.children.length ? 1 : 0));
          }),
        g
      );
    },
    loopChart: function loopChart(g) {
      var h = this,
        k = g.find("tr:first"),
        l = { id: k.find(".node")[0].id };
      return (
        k
          .siblings(":last")
          .children()
          .each(function() {
            l.children || (l.children = []),
              l.children.push(h.loopChart(a(this)));
          }),
        l
      );
    },
    getHierarchy: function getHierarchy() {
      if ("undefined" == typeof this.$chart)
        return "Error: orgchart does not exist";
      if (!this.$chart.find(".node").length) return "Error: nodes do not exist";
      var g = !0;
      return (this.$chart.find(".node").each(function() {
        if (!this.id) return (g = !1), !1;
      }),
      !g)
        ? "Error: All nodes of orghcart to be exported must have data-id attribute!"
        : this.loopChart(this.$chart);
    },
    getNodeState: function getNodeState(g, h) {
      var k = {},
        h = h || "self";
      if ("parent" === h) {
        if (((k = g.closest(".nodes").siblings(":first")), k.length))
          return k.is(".hidden") ||
            (!k.is(".hidden") && k.closest(".nodes").is(".hidden"))
            ? { exist: !0, visible: !1 }
            : { exist: !0, visible: !0 };
      } else if ("children" === h) {
        if (((k = g.closest("tr").siblings(":last")), k.length))
          return k.is(".hidden")
            ? { exist: !0, visible: !1 }
            : { exist: !0, visible: !0 };
      } else if ("siblings" === h) {
        if (
          ((k = g
            .closest("table")
            .parent()
            .siblings()),
          k.length)
        )
          return k.is(".hidden") || k.parent().is(".hidden")
            ? { exist: !0, visible: !1 }
            : { exist: !0, visible: !0 };
      } else if (((k = g), k.length))
        return (k.closest(".nodes").length &&
          k.closest(".nodes").is(".hidden")) ||
          (k.closest("table").parent().length &&
            k
              .closest("table")
              .parent()
              .is(".hidden")) ||
          (k.parent().is("li") &&
            (k.closest("ul").is(".hidden") ||
              k.closest("verticalNodes").is(".hidden")))
          ? { exist: !0, visible: !1 }
          : { exist: !0, visible: !0 };
      return { exist: !1, visible: !1 };
    },
    getRelatedNodes: function getRelatedNodes(g, h) {
      return g && g instanceof a && g.is(".node")
        ? "parent" === h
          ? g
              .closest(".nodes")
              .parent()
              .children(":first")
              .find(".node")
          : "children" === h
            ? g
                .closest("tr")
                .siblings(".nodes")
                .children()
                .find(".node:first")
            : "siblings" === h
              ? g
                  .closest("table")
                  .parent()
                  .siblings()
                  .find(".node:first")
              : a()
        : a();
    },
    hideParentEnd: function hideParentEnd(g) {
      a(g.target).removeClass("sliding"),
        g.data.upperLevel
          .addClass("hidden")
          .slice(1)
          .removeAttr("style");
    },
    hideParent: function hideParent(g) {
      var h = g.closest(".nodes").siblings();
      h.eq(0).find(".spinner").length &&
        g.closest(".orgchart").data("inAjax", !1),
        this.getNodeState(g, "siblings").visible && this.hideSiblings(g);
      var k = h.slice(1);
      k.css("visibility", "hidden");
      var l = h.eq(0).find(".node");
      this.getNodeState(l).visible &&
        l
          .addClass("sliding slide-down")
          .one("transitionend", { upperLevel: h }, this.hideParentEnd),
        this.getNodeState(l, "parent").visible && this.hideParent(l);
    },
    showParentEnd: function showParentEnd(g) {
      var h = g.data.node;
      a(g.target).removeClass("sliding"),
        this.isInAction(h) && this.switchVerticalArrow(h.children(".topEdge"));
    },
    showParent: function showParent(g) {
      var h = g
        .closest(".nodes")
        .siblings()
        .removeClass("hidden");
      h.eq(2)
        .children()
        .slice(1, -1)
        .addClass("hidden");
      var k = h.eq(0).find(".node");
      this.repaint(k[0]),
        k
          .addClass("sliding")
          .removeClass("slide-down")
          .one("transitionend", { node: g }, this.showParentEnd.bind(this));
    },
    stopAjax: function stopAjax(g) {
      g.find(".spinner").length && g.closest(".orgchart").data("inAjax", !1);
    },
    isVisibleNode: function isVisibleNode(g, h) {
      return this.getNodeState(a(h)).visible;
    },
    hideChildrenEnd: function hideChildrenEnd(g) {
      var h = g.data.node;
      g.data.animatedNodes.removeClass("sliding"),
        g.data.isVerticalDesc
          ? g.data.lowerLevel.addClass("hidden")
          : (g.data.animatedNodes
              .closest(".nodes")
              .prevAll(".lines")
              .removeAttr("style")
              .addBack()
              .addClass("hidden"),
            g.data.lowerLevel
              .last()
              .find(".verticalNodes")
              .addClass("hidden")),
        this.isInAction(h) &&
          this.switchVerticalArrow(h.children(".bottomEdge"));
    },
    hideChildren: function hideChildren(g) {
      var h = g.closest("tr").siblings();
      this.stopAjax(h.last());
      var k = h
          .last()
          .find(".node")
          .filter(this.isVisibleNode.bind(this)),
        l = !!h.last().is(".verticalNodes");
      l ||
        k
          .closest("table")
          .closest("tr")
          .prevAll(".lines")
          .css("visibility", "hidden"),
        this.repaint(k.get(0)),
        k
          .addClass("sliding slide-up")
          .eq(0)
          .one(
            "transitionend",
            { animatedNodes: k, lowerLevel: h, isVerticalDesc: l, node: g },
            this.hideChildrenEnd.bind(this)
          );
    },
    showChildrenEnd: function showChildrenEnd(g) {
      var h = g.data.node;
      g.data.animatedNodes.removeClass("sliding"),
        this.isInAction(h) &&
          this.switchVerticalArrow(h.children(".bottomEdge"));
    },
    showChildren: function showChildren(g) {
      var h = this,
        k = g.closest("tr").siblings(),
        l = !!k.is(".verticalNodes"),
        m = l
          ? k
              .removeClass("hidden")
              .find(".node")
              .filter(this.isVisibleNode.bind(this))
          : k
              .removeClass("hidden")
              .eq(2)
              .children()
              .find(".node:first")
              .filter(this.isVisibleNode.bind(this));
      this.repaint(m.get(0)),
        m
          .addClass("sliding")
          .removeClass("slide-up")
          .eq(0)
          .one(
            "transitionend",
            { node: g, animatedNodes: m },
            this.showChildrenEnd.bind(this)
          );
    },
    hideSiblingsEnd: function hideSiblingsEnd(g) {
      var h = g.data.node,
        k = g.data.nodeContainer,
        l = g.data.direction;
      g.data.lines.removeAttr("style");
      var m = l
        ? "left" === l
          ? k.prevAll(":not(.hidden)")
          : k.nextAll(":not(.hidden)")
        : k.siblings();
      k
        .closest(".nodes")
        .prev()
        .children(":not(.hidden)")
        .slice(1, l ? 2 * m.length + 1 : -1)
        .addClass("hidden"),
        g.data.animatedNodes.removeClass("sliding"),
        m
          .find(".node:gt(0)")
          .filter(this.isVisibleNode.bind(this))
          .removeClass("slide-left slide-right")
          .addClass("slide-up"),
        m
          .find(".lines, .nodes, .verticalNodes")
          .addClass("hidden")
          .end()
          .addClass("hidden"),
        this.isInAction(h) && this.switchHorizontalArrow(h);
    },
    hideSiblings: function hideSiblings(g, h) {
      var k = this,
        l = g.closest("table").parent();
      l.siblings().find(".spinner").length &&
        g.closest(".orgchart").data("inAjax", !1),
        h
          ? "left" === h
            ? l
                .prevAll()
                .find(".node")
                .filter(this.isVisibleNode.bind(this))
                .addClass("sliding slide-right")
            : l
                .nextAll()
                .find(".node")
                .filter(this.isVisibleNode.bind(this))
                .addClass("sliding slide-left")
          : (l
              .prevAll()
              .find(".node")
              .filter(this.isVisibleNode.bind(this))
              .addClass("sliding slide-right"),
            l
              .nextAll()
              .find(".node")
              .filter(this.isVisibleNode.bind(this))
              .addClass("sliding slide-left"));
      var m = l.siblings().find(".sliding"),
        n = m
          .closest(".nodes")
          .prevAll(".lines")
          .css("visibility", "hidden");
      m.eq(0).one(
        "transitionend",
        { node: g, nodeContainer: l, direction: h, animatedNodes: m, lines: n },
        this.hideSiblingsEnd.bind(this)
      );
    },
    showSiblingsEnd: function showSiblingsEnd(g) {
      var h = g.data.node;
      g.data.visibleNodes.removeClass("sliding"),
        this.isInAction(h) &&
          (this.switchHorizontalArrow(h),
          h
            .children(".topEdge")
            .removeClass("fa-chevron-up")
            .addClass("fa-chevron-down"));
    },
    showRelatedParentEnd: function showRelatedParentEnd(g) {
      a(g.target).removeClass("sliding");
    },
    showSiblings: function showSiblings(g, h) {
      var k = this,
        l = a();
      l = h
        ? "left" === h
          ? g
              .closest("table")
              .parent()
              .prevAll()
              .removeClass("hidden")
          : g
              .closest("table")
              .parent()
              .nextAll()
              .removeClass("hidden")
        : g
            .closest("table")
            .parent()
            .siblings()
            .removeClass("hidden");
      var m = g
        .closest("table")
        .closest("tr")
        .siblings();
      if (
        (h
          ? m
              .eq(2)
              .children(".hidden")
              .slice(0, 2 * l.length)
              .removeClass("hidden")
          : m
              .eq(2)
              .children(".hidden")
              .removeClass("hidden"),
        !this.getNodeState(g, "parent").visible)
      ) {
        m.removeClass("hidden");
        var n = m.find(".node")[0];
        this.repaint(n),
          a(n)
            .addClass("sliding")
            .removeClass("slide-down")
            .one("transitionend", this.showRelatedParentEnd);
      }
      var o = l.find(".node").filter(this.isVisibleNode.bind(this));
      this.repaint(o.get(0)),
        o.addClass("sliding").removeClass("slide-left slide-right"),
        o
          .eq(0)
          .one(
            "transitionend",
            { node: g, visibleNodes: o },
            this.showSiblingsEnd.bind(this)
          );
    },
    startLoading: function startLoading(g) {
      var h = this.$chart;
      return "undefined" != typeof h.data("inAjax") && !0 === h.data("inAjax")
        ? !1
        : (g.addClass("hidden"),
          g
            .parent()
            .append('<i class="fa fa-circle-o-notch fa-spin spinner"></i>')
            .children()
            .not(".spinner")
            .css("opacity", 0.2),
          h.data("inAjax", !0),
          a(
            ".oc-export-btn" +
              ("" === this.options.chartClass
                ? ""
                : "." + this.options.chartClass)
          ).prop("disabled", !0),
          !0);
    },
    endLoading: function endLoading(g) {
      var h = g.parent();
      g.removeClass("hidden"),
        h.find(".spinner").remove(),
        h.children().removeAttr("style"),
        this.$chart.data("inAjax", !1),
        a(
          ".oc-export-btn" +
            ("" === this.options.chartClass
              ? ""
              : "." + this.options.chartClass)
        ).prop("disabled", !1);
    },
    isInAction: function isInAction(g) {
      return !!(
        -1 <
        g
          .children(".edge")
          .attr("class")
          .indexOf("fa-")
      );
    },
    switchVerticalArrow: function switchVerticalArrow(g) {
      g.toggleClass("fa-chevron-up").toggleClass("fa-chevron-down");
    },
    switchHorizontalArrow: function switchHorizontalArrow(g) {
      var h = this.options;
      if (
        h.toggleSiblingsResp &&
        ("undefined" == typeof h.ajaxURL ||
          g.closest(".nodes").data("siblingsLoaded"))
      ) {
        var k = g
          .closest("table")
          .parent()
          .prev();
        k.length &&
          (k.is(".hidden")
            ? g
                .children(".leftEdge")
                .addClass("fa-chevron-left")
                .removeClass("fa-chevron-right")
            : g
                .children(".leftEdge")
                .addClass("fa-chevron-right")
                .removeClass("fa-chevron-left"));
        var l = g
          .closest("table")
          .parent()
          .next();
        l.length &&
          (l.is(".hidden")
            ? g
                .children(".rightEdge")
                .addClass("fa-chevron-right")
                .removeClass("fa-chevron-left")
            : g
                .children(".rightEdge")
                .addClass("fa-chevron-left")
                .removeClass("fa-chevron-right"));
      } else {
        var m = g
            .closest("table")
            .parent()
            .siblings(),
          n = !!m.length && !m.is(".hidden");
        g
          .children(".leftEdge")
          .toggleClass("fa-chevron-right", n)
          .toggleClass("fa-chevron-left", !n),
          g
            .children(".rightEdge")
            .toggleClass("fa-chevron-left", n)
            .toggleClass("fa-chevron-right", !n);
      }
    },
    repaint: function repaint(g) {
      g && (g.style.offsetWidth = g.offsetWidth);
    },
    nodeEnterLeaveHandler: function nodeEnterLeaveHandler(g) {
      var h = a(g.delegateTarget),
        k = !1,
        l = h.children(".topEdge"),
        m = h.children(".rightEdge"),
        n = h.children(".bottomEdge"),
        o = h.children(".leftEdge");
      "mouseenter" === g.type
        ? (l.length &&
            ((k = this.getNodeState(h, "parent").visible),
            l
              .toggleClass("fa-chevron-up", !k)
              .toggleClass("fa-chevron-down", k)),
          n.length &&
            ((k = this.getNodeState(h, "children").visible),
            n
              .toggleClass("fa-chevron-down", !k)
              .toggleClass("fa-chevron-up", k)),
          o.length && this.switchHorizontalArrow(h))
        : h
            .children(".edge")
            .removeClass(
              "fa-chevron-up fa-chevron-down fa-chevron-right fa-chevron-left"
            );
    },
    nodeClickHandler: function nodeClickHandler(g) {
      this.$chart.find(".focused").removeClass("focused"),
        a(g.delegateTarget).addClass("focused");
    },
    loadNodes: function loadNodes(g, h, k) {
      var l = this,
        m = this.options;
      a.ajax({ url: h, dataType: "json" })
        .done(function(n) {
          l.$chart.data("inAjax") &&
            ("parent" === g
              ? !a.isEmptyObject(n) && l.addParent(k.parent(), n)
              : "children" === g
                ? n.children.length && l.addChildren(k.parent(), n[g])
                : l.addSiblings(k.parent(), n.siblings ? n.siblings : n));
        })
        .fail(function() {
          console.log("Failed to get " + g + " data");
        })
        .always(function() {
          l.endLoading(k);
        });
    },
    HideFirstParentEnd: function HideFirstParentEnd(g) {
      var h = g.data.topEdge,
        k = h.parent();
      this.isInAction(k) &&
        (this.switchVerticalArrow(h), this.switchHorizontalArrow(k));
    },
    topEdgeClickHandler: function topEdgeClickHandler(g) {
      g.stopPropagation();
      var h = this,
        k = a(g.target),
        l = a(g.delegateTarget),
        m = this.getNodeState(l, "parent");
      if (m.exist) {
        var n = l
          .closest("table")
          .closest("tr")
          .siblings(":first")
          .find(".node");
        if (n.is(".sliding")) return;
        m.visible
          ? (this.hideParent(l),
            n.one(
              "transitionend",
              { topEdge: k },
              this.HideFirstParentEnd.bind(this)
            ))
          : this.showParent(l);
      } else if (this.startLoading(k)) {
        var o = this.options,
          p = a.isFunction(o.ajaxURL.parent)
            ? o.ajaxURL.parent(l.data("nodeData"))
            : o.ajaxURL.parent + l[0].id;
        this.loadNodes("parent", p, k);
      }
    },
    bottomEdgeClickHandler: function bottomEdgeClickHandler(g) {
      g.stopPropagation();
      var h = a(g.target),
        k = a(g.delegateTarget),
        l = this.getNodeState(k, "children");
      if (l.exist) {
        var m = k.closest("tr").siblings(":last");
        if (m.find(".sliding").length) return;
        l.visible ? this.hideChildren(k) : this.showChildren(k);
      } else if (this.startLoading(h)) {
        var n = this.options,
          o = a.isFunction(n.ajaxURL.children)
            ? n.ajaxURL.children(k.data("nodeData"))
            : n.ajaxURL.children + k[0].id;
        this.loadNodes("children", o, h);
      }
    },
    hEdgeClickHandler: function hEdgeClickHandler(g) {
      g.stopPropagation();
      var h = a(g.target),
        k = a(g.delegateTarget),
        l = this.options,
        m = this.getNodeState(k, "siblings");
      if (m.exist) {
        var n = k
          .closest("table")
          .parent()
          .siblings();
        if (n.find(".sliding").length) return;
        if (l.toggleSiblingsResp) {
          var o = k
              .closest("table")
              .parent()
              .prev(),
            p = k
              .closest("table")
              .parent()
              .next();
          h.is(".leftEdge")
            ? o.is(".hidden")
              ? this.showSiblings(k, "left")
              : this.hideSiblings(k, "left")
            : p.is(".hidden")
              ? this.showSiblings(k, "right")
              : this.hideSiblings(k, "right");
        } else m.visible ? this.hideSiblings(k) : this.showSiblings(k);
      } else if (this.startLoading(h)) {
        var q = k[0].id,
          r = this.getNodeState(k, "parent").exist
            ? a.isFunction(l.ajaxURL.siblings)
              ? l.ajaxURL.siblings(k.data("nodeData"))
              : l.ajaxURL.siblings + q
            : a.isFunction(l.ajaxURL.families)
              ? l.ajaxURL.families(k.data("nodeData"))
              : l.ajaxURL.families + q;
        this.loadNodes("siblings", r, h);
      }
    },
    expandVNodesEnd: function expandVNodesEnd(g) {
      g.data.vNodes.removeClass("sliding");
    },
    collapseVNodesEnd: function collapseVNodesEnd(g) {
      g.data.vNodes
        .removeClass("sliding")
        .closest("ul")
        .addClass("hidden");
    },
    toggleVNodes: function toggleVNodes(g) {
      var h = a(g.target),
        k = h.parent().next(),
        l = k.find(".node"),
        m = k.children().children(".node");
      m.is(".sliding") ||
        (h.toggleClass("fa-plus-square fa-minus-square"),
        l.eq(0).is(".slide-up")
          ? (k.removeClass("hidden"),
            this.repaint(m.get(0)),
            m
              .addClass("sliding")
              .removeClass("slide-up")
              .eq(0)
              .one("transitionend", { vNodes: m }, this.expandVNodesEnd))
          : (l
              .addClass("sliding slide-up")
              .eq(0)
              .one("transitionend", { vNodes: l }, this.collapseVNodesEnd),
            l
              .find(".toggleBtn")
              .removeClass("fa-minus-square")
              .addClass("fa-plus-square")));
    },
    createGhostNode: function createGhostNode(g) {
      var n,
        o,
        h = a(g.target),
        k = this.options,
        l = g.originalEvent,
        m = /firefox/.test(b.navigator.userAgent.toLowerCase());
      c.querySelector(".ghost-node")
        ? ((n = h
            .closest(".orgchart")
            .children(".ghost-node")
            .get(0)),
          (o = a(n)
            .children()
            .get(0)))
        : ((n = c.createElementNS("http://www.w3.org/2000/svg", "svg")),
          n.classList.add("ghost-node"),
          (o = c.createElementNS("http://www.w3.org/2000/svg", "rect")),
          n.appendChild(o),
          h.closest(".orgchart").append(n));
      var p = h
          .closest(".orgchart")
          .css("transform")
          .split(","),
        q = "t2b" === k.direction || "b2t" === k.direction,
        r = Math.abs(
          b.parseFloat(q ? p[0].slice(p[0].indexOf("(") + 1) : p[1])
        );
      n.setAttribute("width", q ? h.outerWidth(!1) : h.outerHeight(!1)),
        n.setAttribute("height", q ? h.outerHeight(!1) : h.outerWidth(!1)),
        o.setAttribute("x", 5 * r),
        o.setAttribute("y", 5 * r),
        o.setAttribute("width", 120 * r),
        o.setAttribute("height", 40 * r),
        o.setAttribute("rx", 4 * r),
        o.setAttribute("ry", 4 * r),
        o.setAttribute("stroke-width", 1 * r);
      var s = l.offsetX * r,
        t = l.offsetY * r;
      if (
        ("l2r" === k.direction
          ? ((s = l.offsetY * r), (t = l.offsetX * r))
          : "r2l" === k.direction
            ? ((s = h.outerWidth(!1) - l.offsetY * r), (t = l.offsetX * r))
            : "b2t" === k.direction &&
              ((s = h.outerWidth(!1) - l.offsetX * r),
              (t = h.outerHeight(!1) - l.offsetY * r)),
        m)
      ) {
        o.setAttribute("fill", "rgb(255, 255, 255)"),
          o.setAttribute("stroke", "rgb(191, 0, 0)");
        var u = c.createElement("img");
        (u.src =
          "data:image/svg+xml;utf8," +
          new XMLSerializer().serializeToString(n)),
          l.dataTransfer.setDragImage(u, s, t);
      } else l.dataTransfer.setDragImage(n, s, t);
    },
    filterAllowedDropNodes: function filterAllowedDropNodes(g) {
      var h = this.options,
        k = g
          .closest(".nodes")
          .siblings()
          .eq(0)
          .find(".node:first"),
        l = g.closest("table").find(".node");
      this.$chart
        .data("dragged", g)
        .find(".node")
        .each(function(m, n) {
          -1 === l.index(n) &&
            (h.dropCriteria
              ? h.dropCriteria(g, k, a(n)) && a(n).addClass("allowedDrop")
              : a(n).addClass("allowedDrop"));
        });
    },
    dragstartHandler: function dragstartHandler(g) {
      g.originalEvent.dataTransfer.setData("text/html", "hack for firefox"),
        "none" !== this.$chart.css("transform") && this.createGhostNode(g),
        this.filterAllowedDropNodes(a(g.target));
    },
    dragoverHandler: function dragoverHandler(g) {
      g.preventDefault(),
        a(g.delegateTarget).is(".allowedDrop") ||
          (g.originalEvent.dataTransfer.dropEffect = "none");
    },
    dragendHandler: function dragendHandler() {
      this.$chart.find(".allowedDrop").removeClass("allowedDrop");
    },
    dropHandler: function dropHandler(g) {
      var h = a(g.delegateTarget),
        k = this.$chart.data("dragged"),
        l = k
          .closest(".nodes")
          .siblings()
          .eq(0)
          .children(),
        m = a.Event("nodedrop.orgchart");
      if (
        (this.$chart.trigger(m, {
          draggedNode: k,
          dragZone: l.children(),
          dropZone: h
        }),
        !m.isDefaultPrevented())
      ) {
        if (!h.closest("tr").siblings().length)
          h.append('<i class="edge verticalEdge bottomEdge fa"></i>')
            .parent()
            .attr("colspan", 2)
            .parent()
            .after(
              '<tr class="lines"><td colspan="2"><div class="downLine"></div></td></tr><tr class="lines"><td class="rightLine"></td><td class="leftLine"></td></tr><tr class="nodes"></tr>'
            )
            .siblings(":last")
            .append(
              k
                .find(".horizontalEdge")
                .remove()
                .end()
                .closest("table")
                .parent()
            );
        else {
          var n = parseInt(h.parent().attr("colspan")) + 2,
            o =
              '<i class="edge horizontalEdge rightEdge fa"></i><i class="edge horizontalEdge leftEdge fa"></i>';
          h
            .closest("tr")
            .next()
            .addBack()
            .children()
            .attr("colspan", n),
            k.find(".horizontalEdge").length || k.append(o),
            h
              .closest("tr")
              .siblings()
              .eq(1)
              .children(":last")
              .before(
                '<td class="leftLine topLine"></td><td class="rightLine topLine"></td>'
              )
              .end()
              .next()
              .append(k.closest("table").parent());
          var p = k
            .closest("table")
            .parent()
            .siblings()
            .find(".node:first");
          1 === p.length && p.append(o);
        }
        var q = parseInt(l.attr("colspan"));
        if (2 < q) {
          l.attr("colspan", q - 2)
            .parent()
            .next()
            .children()
            .attr("colspan", q - 2)
            .end()
            .next()
            .children()
            .slice(1, 3)
            .remove();
          var r = l
            .parent()
            .siblings(".nodes")
            .children()
            .find(".node:first");
          1 === r.length && r.find(".horizontalEdge").remove();
        } else
          l.removeAttr("colspan")
            .find(".bottomEdge")
            .remove()
            .end()
            .end()
            .siblings()
            .remove();
      }
    },
    touchstartHandler: function touchstartHandler(g) {
      console.log(
        "orgChart: touchstart 1: touchHandled=" +
          this.touchHandled +
          ", touchMoved=" +
          this.touchMoved +
          ", target=" +
          g.target.innerText
      );
      this.touchHandled ||
        ((this.touchHandled = !0), (this.touchMoved = !1), g.preventDefault());
    },
    touchmoveHandler: function touchmoveHandler(g) {
      if (this.touchHandled) {
        if ((g.preventDefault(), !this.touchMoved)) {
          a(this).hasClass("focused");
          console.log(
            "orgChart: touchmove 1: " +
              g.touches.length +
              " touches, we have not moved, so simulate a drag start",
            g.touches
          ),
            this.simulateMouseEvent(g, "dragstart");
        }
        this.touchMoved = !0;
        var k = a(
            c.elementFromPoint(g.touches[0].clientX, g.touches[0].clientY)
          ),
          l = k.closest("div.node");
        if (0 < l.length) {
          var m = l[0];
          l.is(".allowedDrop")
            ? (console.log(
                "orgChart: touchmove 2: this node (" +
                  m.id +
                  ") is allowed to be a drop target"
              ),
              (this.touchTargetNode = m))
            : (console.log(
                "orgChart: touchmove 3: this node (" +
                  m.id +
                  ") is NOT allowed to be a drop target"
              ),
              (this.touchTargetNode = null));
        } else
          console.log("orgchart: touchmove 4: not touching a node"),
            (this.touchTargetNode = null);
      }
    },
    touchendHandler: function touchendHandler(g) {
      if (
        (console.log(
          "orgChart: touchend 1: touchHandled=" +
            this.touchHandled +
            ", touchMoved=" +
            this.touchMoved +
            ", " +
            g.target.innerText +
            " "
        ),
        !this.touchHandled)
      )
        return void console.log(
          "orgChart: touchend 2: not handled by us, so aborting"
        );
      if (this.touchMoved) {
        if (this.touchTargetNode) {
          console.log(
            "orgChart: touchend 3: moved to a node, so simulating drop"
          );
          var h = { delegateTarget: this.touchTargetNode };
          this.dropHandler(h), (this.touchTargetNode = null);
        }
        console.log("orgChart: touchend 4: simulating dragend"),
          this.simulateMouseEvent(g, "dragend");
      } else
        console.log("orgChart: touchend 5: moved, so simulating click"),
          this.simulateMouseEvent(g, "click");
      this.touchHandled = !1;
    },
    simulateMouseEvent: function simulateMouseEvent(g, h) {
      if (!(1 < g.originalEvent.touches.length)) {
        var k = g.originalEvent.changedTouches[0],
          l = c.createEvent("MouseEvents");
        l.initMouseEvent(
          h,
          !0,
          !0,
          b,
          1,
          k.screenX,
          k.screenY,
          k.clientX,
          k.clientY,
          !1,
          !1,
          !1,
          !1,
          0,
          null
        ),
          g.target.dispatchEvent(l);
      }
    },
    bindDragDrop: function bindDragDrop(g) {
      g.on("dragstart", this.dragstartHandler.bind(this))
        .on("dragover", this.dragoverHandler.bind(this))
        .on("dragend", this.dragendHandler.bind(this))
        .on("drop", this.dropHandler.bind(this))
        .on("touchstart", this.touchstartHandler.bind(this))
        .on("touchmove", this.touchmoveHandler.bind(this))
        .on("touchend", this.touchendHandler.bind(this));
    },
    createNode: function createNode(g) {
      var h = this,
        k = this.options,
        l = g.level;
      g.children &&
        a.each(g.children, function(q, r) {
          r.parentId = g.id;
        });
      var m = a(
        "<div" +
          (k.draggable ? ' draggable="true"' : "") +
          (g[k.nodeId] ? ' id="' + g[k.nodeId] + '"' : "") +
          (g.parentId ? ' data-parent="' + g.parentId + '"' : "") +
          ">"
      ).addClass(
        "node " + (g.className || "") + (l > k.visibleLevel ? " slide-up" : "")
      );
      k.nodeTemplate
        ? m.append(k.nodeTemplate(g))
        : m
            .append('<div class="title">' + g[k.nodeTitle] + "</div>")
            .append(
              "undefined" == typeof k.nodeContent
                ? ""
                : '<div class="content">' + (g[k.nodeContent] || "") + "</div>"
            );
      var n = a.extend({}, g);
      delete n.children, m.data("nodeData", n);
      var o = g.relationship || "";
      if (!(k.verticalLevel && l >= k.verticalLevel))
        +o.substr(0, 1) &&
          m.append('<i class="edge verticalEdge topEdge fa"></i>'),
          +o.substr(1, 1) &&
            m.append(
              '<i class="edge horizontalEdge rightEdge fa"></i><i class="edge horizontalEdge leftEdge fa"></i>'
            ),
          +o.substr(2, 1) &&
            m
              .append('<i class="edge verticalEdge bottomEdge fa"></i>')
              .children(".title")
              .prepend('<i class="fa ' + k.parentNodeSymbol + ' symbol"></i>');
      else if (l + 1 > k.verticalLevel && +o.substr(2, 1)) {
        var p = l + 1 > k.visibleLevel ? "plus" : "minus";
        m.append('<i class="toggleBtn fa fa-' + p + '-square"></i>');
      }
      return (
        m.on("mouseenter mouseleave", this.nodeEnterLeaveHandler.bind(this)),
        m.on("click", this.nodeClickHandler.bind(this)),
        m.on("click", ".topEdge", this.topEdgeClickHandler.bind(this)),
        m.on("click", ".bottomEdge", this.bottomEdgeClickHandler.bind(this)),
        m.on(
          "click",
          ".leftEdge, .rightEdge",
          this.hEdgeClickHandler.bind(this)
        ),
        m.on("click", ".toggleBtn", this.toggleVNodes.bind(this)),
        k.draggable &&
          (this.bindDragDrop(m),
          (this.touchHandled = !1),
          (this.touchMoved = !1),
          (this.touchTargetNode = null)),
        k.createNode && k.createNode(m, g),
        m
      );
    },
    buildHierarchy: function buildHierarchy(g, h) {
      var k = this,
        l = this.options,
        m = 0;
      m = h.level
        ? h.level
        : (h.level = g.parentsUntil(".orgchart", ".nodes").length + 1);
      var n = h.children,
        o = !!n && n.length,
        p;
      if (2 < Object.keys(h).length) {
        var q = this.createNode(h);
        l.verticalLevel && m >= l.verticalLevel
          ? g.append(q)
          : ((p = a("<table>")),
            g.append(
              p.append(
                a("<tr/>").append(
                  a(
                    "<td" +
                      (o ? ' colspan="' + 2 * n.length + '"' : "") +
                      "></td>"
                  ).append(q)
                )
              )
            ));
      }
      if (o) {
        var t,
          r = m + 1 > l.visibleLevel || h.collapsed ? " hidden" : "",
          s = l.verticalLevel && m + 1 >= l.verticalLevel;
        if (s)
          (t = a("<ul>")),
            r && m + 1 > l.verticalLevel && t.addClass(r),
            m + 1 === l.verticalLevel
              ? g
                  .children("table")
                  .append('<tr class="verticalNodes' + r + '"><td></td></tr>')
                  .find(".verticalNodes")
                  .children()
                  .append(t)
              : g.append(t);
        else {
          for (
            var u = a(
                '<tr class="lines' +
                  r +
                  '"><td colspan="' +
                  2 * n.length +
                  '"><div class="downLine"></div></td></tr>'
              ),
              v = '<tr class="lines' + r + '"><td class="rightLine"></td>',
              w = 1;
            w < n.length;
            w++
          )
            v +=
              '<td class="leftLine topLine"></td><td class="rightLine topLine"></td>';
          (v += '<td class="leftLine"></td></tr>'),
            (t = a('<tr class="nodes' + r + '">')),
            2 === Object.keys(h).length
              ? g
                  .append(u)
                  .append(v)
                  .append(t)
              : p
                  .append(u)
                  .append(v)
                  .append(t);
        }
        a.each(n, function() {
          var x = s ? a("<li>") : a('<td colspan="2">');
          t.append(x), (this.level = m + 1), k.buildHierarchy(x, this);
        });
      }
    },
    buildChildNode: function buildChildNode(g, h) {
      g.find("td:first").attr("colspan", 2 * h.length),
        this.buildHierarchy(g, { children: h });
    },
    addChildren: function addChildren(g, h) {
      this.buildChildNode(g.closest("table"), h),
        g.children(".bottomEdge").length ||
          g.append('<i class="edge verticalEdge bottomEdge fa"></i>'),
        g.find(".symbol").length ||
          g
            .children(".title")
            .prepend(
              '<i class="fa ' + this.options.parentNodeSymbol + ' symbol"></i>'
            ),
        this.isInAction(g) &&
          this.switchVerticalArrow(g.children(".bottomEdge"));
    },
    buildParentNode: function buildParentNode(g, h) {
      h.relationship = h.relationship || "001";
      var k = a("<table>")
        .append(
          a("<tr>").append(a('<td colspan="2">').append(this.createNode(h)))
        )
        .append(
          '<tr class="lines"><td colspan="2"><div class="downLine"></div></td></tr>'
        )
        .append(
          '<tr class="lines"><td class="rightLine"></td><td class="leftLine"></td></tr>'
        );
      this.$chart
        .prepend(k)
        .children("table:first")
        .append('<tr class="nodes"><td colspan="2"></td></tr>')
        .children("tr:last")
        .children()
        .append(this.$chart.children("table").last());
    },
    addParent: function addParent(g, h) {
      this.buildParentNode(g, h),
        g.children(".topEdge").length ||
          g
            .children(".title")
            .after('<i class="edge verticalEdge topEdge fa"></i>'),
        this.isInAction(g) && this.switchVerticalArrow(g.children(".topEdge"));
    },
    complementLine: function complementLine(g, h, k) {
      for (var l = "", m = 0; m < k; m++)
        l +=
          '<td class="leftLine topLine"></td><td class="rightLine topLine"></td>';
      g.parent()
        .prevAll("tr:gt(0)")
        .children()
        .attr("colspan", 2 * h)
        .end()
        .next()
        .children(":first")
        .after(l);
    },
    buildSiblingNode: function buildSiblingNode(g, h) {
      var k = a.isArray(h) ? h.length : h.children.length,
        l = g.parent().is("td") ? g.closest("tr").children().length : 1,
        m = l + k,
        n = 1 < m ? Math.floor(m / 2 - 1) : 0;
      if (g.parent().is("td")) {
        g.closest("tr").prevAll("tr:last");
        g
          .closest("tr")
          .prevAll("tr:lt(2)")
          .remove(),
          this.buildChildNode(g.parent().closest("table"), h);
        var p = g
          .parent()
          .closest("table")
          .children("tr:last")
          .children("td");
        1 < l
          ? this.complementLine(
              p.eq(0).before(
                g
                  .closest("td")
                  .siblings()
                  .addBack()
                  .unwrap()
              ),
              m,
              l
            )
          : this.complementLine(p.eq(n).after(g.closest("td").unwrap()), m, 1);
      } else
        this.buildHierarchy(g.closest(".orgchart"), h),
          this.complementLine(
            g
              .next()
              .children("tr:last")
              .children()
              .eq(n)
              .after(a('<td colspan="2">').append(g)),
            m,
            1
          );
    },
    addSiblings: function addSiblings(g, h) {
      this.buildSiblingNode(g.closest("table"), h),
        g.closest(".nodes").data("siblingsLoaded", !0),
        g.children(".leftEdge").length ||
          g
            .children(".topEdge")
            .after(
              '<i class="edge horizontalEdge rightEdge fa"></i><i class="edge horizontalEdge leftEdge fa"></i>'
            ),
        this.isInAction(g) &&
          (this.switchHorizontalArrow(g),
          g
            .children(".topEdge")
            .removeClass("fa-chevron-up")
            .addClass("fa-chevron-down"));
    },
    removeNodes: function removeNodes(g) {
      var h = g.closest("table").parent(),
        k = h.parent().siblings();
      h.is("td")
        ? this.getNodeState(g, "siblings").exist
          ? (k
              .eq(2)
              .children(".topLine:lt(2)")
              .remove(),
            k
              .slice(0, 2)
              .children()
              .attr("colspan", k.eq(2).children().length),
            h.remove())
          : k
              .eq(0)
              .children()
              .removeAttr("colspan")
              .find(".bottomEdge")
              .remove()
              .end()
              .end()
              .siblings()
              .remove()
        : h.add(h.siblings()).remove();
    },
    export: function _export(g, h) {
      var k = this;
      if (
        ((g = "undefined" == typeof g ? this.options.exportFilename : g),
        (h = "undefined" == typeof h ? this.options.exportFileextension : h),
        a(this).children(".spinner").length)
      )
        return !1;
      var l = this.$chartContainer,
        m = l.find(".mask");
      m.length
        ? m.removeClass("hidden")
        : l.append(
            '<div class="mask"><i class="fa fa-circle-o-notch fa-spin spinner"></i></div>'
          );
      var n = l
          .addClass("canvasContainer")
          .find('.orgchart:not(".hidden")')
          .get(0),
        o = "l2r" === k.options.direction || "r2l" === k.options.direction;
      html2canvas(n, {
        width: o ? n.clientHeight : n.clientWidth,
        height: o ? n.clientWidth : n.clientHeight,
        onclone: function onclone(p) {
          a(p)
            .find(".canvasContainer")
            .css("overflow", "visible")
            .find('.orgchart:not(".hidden"):first')
            .css("transform", "");
        },
        onrendered: function onrendered(p) {
          if ((l.find(".mask").addClass("hidden"), "pdf" === h.toLowerCase())) {
            var q = {},
              r = Math.floor(0.2646 * p.width),
              s = Math.floor(0.2646 * p.height);
            (q =
              r > s
                ? new jsPDF("l", "mm", [r, s])
                : new jsPDF("p", "mm", [s, r])),
              q.addImage(p.toDataURL(), "png", 0, 0),
              q.save(g + ".pdf");
          } else {
            var t = "WebkitAppearance" in c.documentElement.style,
              u = !!b.sidebar,
              v =
                "Microsoft Internet Explorer" === navigator.appName ||
                ("Netscape" === navigator.appName &&
                  -1 < navigator.appVersion.indexOf("Edge"));
            if ((!t && !u) || v)
              b.navigator.msSaveBlob(p.msToBlob(), g + ".png");
            else {
              var w =
                ".oc-download-btn" +
                ("" === k.options.chartClass ? "" : "." + k.options.chartClass);
              l.find(w).length ||
                l.append(
                  '<a class="oc-download-btn' +
                    ("" === k.options.chartClass
                      ? ""
                      : " " + k.options.chartClass) +
                    '" download="' +
                    g +
                    '.png"></a>'
                ),
                l
                  .find(w)
                  .attr("href", p.toDataURL())[0]
                  .click();
            }
          }
        }
      }).then(
        function() {
          l.removeClass("canvasContainer");
        },
        function() {
          l.removeClass("canvasContainer");
        }
      );
    }
  }),
    (a.fn.orgchart = function(g) {
      return new f(this, g).init();
    });
});
