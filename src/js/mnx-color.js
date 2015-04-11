(function (angular) {
  'use strict';
  var
    ns = 'mnx-color-',
    svg = '<svg width=100% height=100% xmlns=http://www.w3.org/2000/svg><defs>',
    rect = '<rect width=100% height=100% fill=url(#';

  function MnxColor($document) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link(scope, element, attrs, ctrl) {
        var
          rgb = [0, 0, 0], hsv = [0, 0, 0], a = 1, pickers, current,
          container = angular.element('<div class="' + ns + 'container"></div>'),
          color = angular.element([
            '<div name="col" class="' + ns + 'col">',
              svg,
                gradient('s', ['fff', 'fff0']), gradient('v', ['0000', '000'], 1),
              '</defs>', rect + 's)/>', rect + 'v)/></svg>',
            '</div>'
          ].join('')),
          hue = angular.element([
            '<div name="hue" class="' + ns + 'hue">',
              svg,
                gradient('h', ['f00', 'ff0', '0f0', '0ff', '00f', 'f0f', 'f00'], 1),
              '</defs>', rect + 'h)/></svg>',
            '</div>'
          ].join('')),
          alpha = angular.element([
            '<div name="alpha" class="' + ns + 'alpha">',
              svg, gradient('a', ['0000', '000']), '</defs>', rect + 'a)/></svg>',
            '</div>'
          ].join('')),
          stops = alpha.find('stop'),
          ccursor = angular.element('<div class="' + ns + 'ccursor"></div>'),
          hcursor = angular.element('<div class="' + ns + 'hcursor"></div>'),
          acursor = angular.element('<div class="' + ns + 'acursor"></div>'),
          unwatch;

        container
          .append(color.append(ccursor))
          .append(hue.append(hcursor))
          .append(alpha.append(acursor));
        element.on('focus', function () {
          container.css({
            top: element[0].offsetTop + element[0].offsetHeight + 'px',
            left: element[0].offsetLeft + 'px'
          });
          element.after(container);
          color.on('mousedown', mousedown);
          hue.on('mousedown', mousedown);
          alpha.on('mousedown', mousedown);
          inputUpdate();
          watch();
          element.on('blur', function blur() {
            element.off('blur', blur);
            unwatch();
            container.remove();
          });
        });

        function watch() {
          unwatch = scope.$watch(attrs.ngModel, inputParse);
        }

        function mousedown(event) {
          var _this = this, parent = _this.offsetParent;
          current = {
            name: _this.getAttribute('name'),
            width: _this.clientWidth - 1,
            height: _this.clientHeight - 1,
            top: parent.offsetTop + parent.clientTop + _this.offsetTop + _this.clientTop,
            left: parent.offsetLeft + parent.clientLeft + _this.offsetLeft + _this.clientLeft
          }
          unwatch();
          mousemove(event);
          $document.on('mousemove', mousemove).on('mouseup', function mouseup() {
            $document.off('mousemove', mousemove).off('mouseup', mouseup);
            watch();
          });
        }

        function mousemove(event) {
          var
            x = Math.min(current.width, Math.max(0, event.pageX - current.left)),
            y = Math.min(current.height, Math.max(0, event.pageY - current.top));
          event.stopPropagation();
          event.preventDefault();
          pickerUpdate(x, y);
        }

        function pickerUpdate(x, y) {
          if (current.name === 'alpha') {
            a = x / current.width;
            acursor.css({ left: x + 'px' });
          } else {
            if (current.name === 'col') {
              hsv[1] = x / current.width;
              hsv[2] = (current.height - y) / current.height;
              ccursor.css({ top: y + 'px', left: x + 'px' });
            } else if (current.name === 'hue') {
              hsv[0] = y / current.height;
              hcursor.css({ top: y + 'px' });
              color.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], 1, 1]) + ')' });
            }
            rgb = hsvToRgb(hsv);
            stops.attr('stop-color', 'rgb(' + rgb + ')');
          }
          if (a !== 1) ctrl.$setViewValue('rgba(' + rgb + ',' + Math.round(a * 100) / 100 + ')');
          else ctrl.$setViewValue('#' + rgb[0].toString(16) + rgb[1].toString(16) + rgb[2].toString(16));
          ctrl.$render();
        }

        function inputParse(value, old) {
          if (value === old) return;
          var m = [];
          if ((m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value))) {
            rgb = [parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16), parseInt(m[3] + m[3], 16)];
          } else if ((m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value))) {
            rgb = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
          } else if ((m = /^rgba?\((\d+),\s?(\d+),\s?(\d+),?\s?(\d*\.?\d+)?\)$/.exec(value))) {
            rgb = [+m[1], +m[2], +m[3]];
          } else if (value && (m = /^[a-z]{3,}$/i.exec(value))) {
            hue.css({ color: m[0] });
            m = window.getComputedStyle(hue[0]).color.match(/(\d)+/g) || [0, 0, 0, '0'];
            m.unshift(0);
            rgb = [+m[1], +m[2], +m[3]];
          } else {
            return;
          }
          a = +(m[4] || 1);
          inputUpdate();
        }

        function inputUpdate() {
          hsv = rgbToHsv(rgb);
          ccursor.css({
            top: Math.round((color[0].clientHeight - 1) - hsv[2] * (color[0].clientHeight - 1)) + 'px',
            left: Math.round(hsv[1] * (color[0].clientWidth - 1)) + 'px'
          });
          hcursor.css({ top: Math.round(hsv[0] * (hue[0].clientHeight - 1)) + 'px', left: 0 });
          acursor.css({ top: 0, left: Math.round(a * (alpha[0].clientWidth - 1)) + 'px' });
          color.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], 1, 1]) + ')' });
          stops.attr('stop-color', 'rgb(' + rgb + ')');
        }
      }
    };
  }
  MnxColor.$inject = ['$document'];

  function gradient(id, stops, dir) {
    var
      g = ['<linearGradient id=', id, dir ? ' x2=0 y2=1' : '', '>'],
      i = 0, len = stops.length - 1;
    for (; i <= len; i += 1) {
      g.push(
        '<stop offset=', i / len,
        ' stop-color=#', stops[i].substr(0, 3),
        ' stop-opacity=', stops[i][3] || 1, '/>');
    }
    g.push('</linearGradient>');
    return g.join('');
  }

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

  angular.module('mnxColor', []).directive('mnxColor', MnxColor);
})(window.angular);
