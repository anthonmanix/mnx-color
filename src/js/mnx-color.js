(function (angular) {
  'use strict';
  function MnxColor($document) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link(scope, element, attrs, ctrl) {
        var
          rgb = [0, 0, 0], hsv = [0, 0, 0], a = 1, pickers, current,
          container = angular.element('<div class="cp-container"></div>'),
          color = angular.element([
            '<div name="col" class="cp-col">',
              '<svg width=100% height=100% xmlns=http://www.w3.org/2000/svg>',
                '<defs>',
                  '<linearGradient id=s>',
                    '<stop offset=0 stop-color=#fff/>',
                    '<stop offset=1 stop-color=#fff stop-opacity=0/>',
                  '</linearGradient>',
                  '<linearGradient id=v x2=0 y2=1>',
                    '<stop offset=0 stop-color=#000 stop-opacity=0/>',
                    '<stop offset=1 stop-color=#000/>',
                  '</linearGradient>',
                '</defs>',
                '<rect width=100% height=100% fill=url(#s)/>',
                '<rect width=100% height=100% fill=url(#v)/>',
              '</svg>',
            '</div>'
          ].join('')),
          hue = angular.element([
            '<div name="hue" class="cp-hue">',
              '<svg width=100% height=100% xmlns=http://www.w3.org/2000/svg>',
                '<defs>',
                  '<linearGradient id=h x2=0 y2=1>',
                    '<stop stop-color=#f00 offset=0/>',
                    '<stop stop-color=#ff0 offset=.17/>',
                    '<stop stop-color=#0f0 offset=.33/>',
                    '<stop stop-color=#0ff offset=.5/>',
                    '<stop stop-color=#00f offset=.67/>',
                    '<stop stop-color=#f0f offset=.83/>',
                    '<stop stop-color=#f00 offset=1/>',
                  '</linearGradient>',
                '</defs>',
                '<rect width=100% height=100% fill=url(#h)/>',
              '</svg>',
            '</div>'
          ].join('')),
          alpha = angular.element([
            '<div name="alpha" class="cp-alpha">',
              '<svg width=100% height=100% xmlns=http://www.w3.org/2000/svg>',
                '<defs>',
                  '<linearGradient id=a>',
                    '<stop offset=0 stop-opacity=0 stop-color=#0/>',
                    '<stop offset=1 stop-color=#000/>',
                  '</linearGradient>',
                '</defs>',
                '<rect width=100% height=100% fill=url(#a)/>',
              '</svg>',
            '</div>'
          ].join('')),
          stops = alpha.find('stop'),
          ccursor = angular.element('<div class="cp-ccursor"></div>'),
          hcursor = angular.element('<div class="cp-hcursor"></div>'),
          acursor = angular.element('<div class="cp-acursor"></div>'),
          unwatch;

        container.append(color).append(hue).append(alpha);
        color.append(ccursor).on('mousedown', mousedown);
        hue.append(hcursor).on('mousedown', mousedown);
        alpha.append(acursor).on('mousedown', mousedown);
        element.append(container);
        pickers = { col: pickerMeta(color), hue: pickerMeta(hue), alpha: pickerMeta(alpha) };
        inputUpdate();
        watch();

        function pickerMeta(picker) {
          return {
            name: picker.attr('name'),
            width: picker.prop('clientWidth') - 1, height: picker.prop('clientHeight') - 1,
            top: picker.prop('offsetTop'), left: picker.prop('offsetLeft')
          };
        }

        function watch() {
          unwatch = scope.$watch(attrs.ngModel, inputParse);
        }

        function mousedown(event) {
          unwatch();
          current = pickers[angular.element(this).attr('name')];
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
        }

        function inputParse(value) {
          var m = [];
          if ((m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value))) {
            rgb = [parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16), parseInt(m[3] + m[3], 16)];
          } else if ((m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value))) {
            rgb = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
          } else if ((m = /^rgba?\((\d+),\s?(\d+),\s?(\d+),?\s?(\d*\.?\d+)?\)$/.exec(value))) {
            rgb = [+m[1], +m[2], +m[3]];
          } else if (value && (m = /^[a-z]{3,}$/i.exec(value))) {
            hue.css({ color: m[0] });
            if (hue.css('color') !== value) return;
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
            top: Math.round(pickers.col.height - hsv[2] * pickers.col.height) + 'px',
            left: Math.round(hsv[1] * pickers.col.width) + 'px'
          });
          hcursor.css({ top: Math.round(hsv[0] * pickers.hue.height) + 'px', left: 0 });
          acursor.css({ top: 0, left: Math.round(a * pickers.alpha.width) + 'px' });
          color.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], 1, 1]) + ')' });
          stops.attr('stop-color', 'rgb(' + rgb + ')');
        }
      }
    };
  }
  MnxColor.$inject = ['$document'];

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
