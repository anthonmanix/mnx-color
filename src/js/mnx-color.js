(function (angular) {
  'use strict';
  var ns = 'mnx-color-';
  
  /**
   * Creates a layered SVG gradient
   *
   * @param {Object[]} layers - gradient layers
   * @param {string} layers[].stops - color stops of gradient layer
   * @param {string} [layers[].dir=0] - gradient direction (0 - horizontal | 1 - vertical)
   * @returns {string} SVG gradient
   */
  function gradient(layers) {
    var
      svg = ['<svg width=100% height=100% xmlns=http://www.w3.org/2000/svg>'],
      defs = ['<defs>'],
      lidx, llen = layers.length,
      stops, sidx, slen;
    
    for (lidx = 0; lidx < llen; lidx += 1) {
      defs.push('<linearGradient id=g', lidx, layers[lidx].dir ? ' x2=0 y2=1' : '', '>');
      stops = layers[lidx].stops;
      slen = stops.length - 1;
      for (sidx = 0; sidx <= slen; sidx += 1) {
        defs.push('<stop offset=', sidx / slen, ' stop-color=#', stops[sidx].substr(0, 3), ' stop-opacity=', stops[sidx][3] || 1, '/>');
      }
      defs.push('</linearGradient>');
      svg.push('<rect width=100% height=100% fill=url(#g', lidx, ')/>');
    }
    defs.push('</defs>');
    svg.splice(1, 0, defs.join(''));
    defs.push('</svg>');
    
    return svg.join('');
  }
  
  /**
   * Converts RGB to HSV
   *
   * @param {number[]} - integer values of RGB chanels
   * @returns {number[]} - number values of HSV chanels
   */
  function rgbToHsv(rgb) {
    var
      r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255,
      max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min,
      h = 0, s = 0;
    if (max !== min) {
      switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
      s = d / max;
    }
    return [h, s, max];
  }
  
  /**
   * Converts HSV to RGB
   *
   * @param {number[]} - number values of HSV chanels
   * @returns {number[]} - integer values of RGB chanels
   */
  function hsvToRgb(hsv) {
    var
      h = hsv[0] * 6, s = hsv[1], v = hsv[2],
      i = Math.floor(h),
      f = h - i,
      p = v * (1 - s),
      q = v * (1 - s * f),
      t = v * (1 - s * (1 - f)),
      mod = i % 6,
      r = [v, q, p, p, t, v][mod],
      g = [t, v, v, q, p, p][mod],
      b = [p, p, t, v, v, q][mod];
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function MnxColor($document) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link(scope, element, attrs, ctrl) {
        var
          container = angular.element('<div class="' + ns + 'container"></div>'),
          lch = angular.element([
            '<div name="lch" class="' + ns + 'lch">',
            gradient([{ stops: ['fff', 'fff0'] }, { stops: ['0000', '000'], dir: 1 }]),
            '</div>'
          ].join('')),
          rch = angular.element([
            '<div name="rch" class="' + ns + 'rch">',
            gradient([{ stops: ['f00', 'ff0', '0f0', '0ff', '00f', 'f0f', 'f00'], dir: 1 }]),
            '</div>'
          ].join('')),
          alpha = angular.element([
            '<div name="alpha" class="' + ns + 'alpha">',
            gradient([{ stops: ['0000', '000'] }]),
            '</div>'
          ].join('')),
          stops = alpha.find('stop'),
          lcur = angular.element('<div class="' + ns + 'lcur"></div>'),
          rcur = angular.element('<div class="' + ns + 'rcur"></div>'),
          acur = angular.element('<div class="' + ns + 'acur"></div>'),
          rgb = [0, 0, 0], hsv = [0, 0, 0], a = 1, current, unwatch;
        
        function pickerUpdate(x, y) {
          if (current.name === 'alpha') {
            a = x / current.width;
            acur.css({ left: x + 'px' });
          } else {
            if (current.name === 'lch') {
              hsv[1] = x / current.width;
              hsv[2] = (current.height - y) / current.height;
              lcur.css({ top: y + 'px', left: x + 'px' });
            } else if (current.name === 'rch') {
              hsv[0] = y / current.height;
              rcur.css({ top: y + 'px' });
              lch.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], 1, 1]) + ')' });
            }
            rgb = hsvToRgb(hsv);
            stops.attr('stop-color', 'rgb(' + rgb + ')');
          }
          if (a !== 1) {
            ctrl.$setViewValue('rgba(' + rgb + ',' + Math.round(a * 100) / 100 + ')');
          } else {
            ctrl.$setViewValue([
              '#',
              ('0' + rgb[0].toString(16)).substr(-2),
              ('0' + rgb[1].toString(16)).substr(-2),
              ('0' + rgb[2].toString(16)).substr(-2)
            ].join(''));
          }
          ctrl.$render();
        }
        
        function inputUpdate() {
          hsv = rgbToHsv(rgb);
          lcur.css({
            top: Math.round((lch[0].clientHeight - 1) - hsv[2] * (lch[0].clientHeight - 1)) + 'px',
            left: Math.round(hsv[1] * (lch[0].clientWidth - 1)) + 'px'
          });
          rcur.css({ top: Math.round(hsv[0] * (rch[0].clientHeight - 1)) + 'px', left: 0 });
          acur.css({ top: 0, left: Math.round(a * (alpha[0].clientWidth - 1)) + 'px' });
          lch.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], 1, 1]) + ')' });
          stops.attr('stop-color', 'rgb(' + rgb + ')');
        }
        
        function inputParse(value, old) {
          if (value === old) { return; }
          var m = [];
          if ((m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value))) {
            rgb = [parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16), parseInt(m[3] + m[3], 16)];
          } else if ((m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value))) {
            rgb = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
          } else if ((m = /^rgba?\((\d+),\s?(\d+),\s?(\d+),?\s?(\d*\.?\d+)?\)$/.exec(value))) {
            rgb = [+m[1], +m[2], +m[3]];
          } else if (value && (m = /^[a-z]{3,}$/i.exec(value))) {
            alpha.css({ color: 'rgba(' + rgb + ',' + Math.round(a * 100) / 100 + ')' });
            alpha.css({ color: m[0] });
            m = window.getComputedStyle(alpha[0]).color.match(/(\d?\.?\d+)+/g) || [0, 0, 0, '0'];
            if (m.join() === rgb.join() + (a !== 1 ? ',' + a : '')) {
              return;
            }
            m.unshift(0);
            rgb = [+m[1], +m[2], +m[3]];
          } else {
            return;
          }
          a = +(m[4] || 1);
          inputUpdate();
        }
        
        function watch() {
          unwatch = scope.$watch(attrs.ngModel, inputParse);
        }
        
        function mousemove(event) {
          var
            x = Math.min(current.width, Math.max(0, event.pageX - current.left)),
            y = Math.min(current.height, Math.max(0, event.pageY - current.top));
          event.stopPropagation();
          event.preventDefault();
          pickerUpdate(x, y);
        }

        function mousedown(event) {
          var self = this, parent = self.offsetParent;
          current = {
            name: self.getAttribute('name'),
            width: self.clientWidth - 1,
            height: self.clientHeight - 1,
            top: parent.offsetTop + parent.clientTop + self.offsetTop + self.clientTop,
            left: parent.offsetLeft + parent.clientLeft + self.offsetLeft + self.clientLeft
          };
          unwatch();
          mousemove(event);
          $document.on('mousemove', mousemove).on('mouseup', function mouseup() {
            $document.off('mousemove', mousemove).off('mouseup', mouseup);
            watch();
          });
        }
        
        container
          .append(lch.append(lcur))
          .append(rch.append(rcur))
          .append(alpha.append(acur));
        element.on('focus', function focus() {
          container.css({
            top: element[0].offsetTop + element[0].offsetHeight + 'px',
            left: element[0].offsetLeft + 'px'
          });
          element.after(container);
          lch.on('mousedown', mousedown);
          rch.on('mousedown', mousedown);
          alpha.on('mousedown', mousedown);
          inputUpdate();
          watch();
          element.on('blur', function blur() {
            element.off('blur', blur);
            unwatch();
            container.remove();
          });
        });
      }
    };
  }
  MnxColor.$inject = ['$document'];

  angular.module('mnxColor', []).directive('mnxColor', MnxColor);
}(window.angular));
