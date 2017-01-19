(function (angular) {
  'use strict';
  var ns = 'mnx-color-';

  function rgbToHsv(rgb) {
    var
      r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255,
      max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min,
      h = 0, s = 0;

    if (max !== min) {
      if (max === r) { h = (g - b) / d + (g < b ? 6 : 0); }
      if (max === g) { h = (b - r) / d + 2; }
      if (max === b) { h = (r - g) / d + 4; }
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

    return [round(r * 255), round(g * 255), round(b * 255)];
  }

  function hslToHsv(h, s, l) {
    l = l ? l / 100 : 0;
    s = s ? s / 100 : 0;
    s *= l < 0.5 ? l : 1 - l;
    return [h / 360, s ? 2 * s / (l + s) : 0, l + s];
  }

  /** Math helpers */
  function clamp(n, max) { return +n > max ? max : +n < 0 ? 0 : +n; }
  function round(n) { return Math.round(+n); }
  
  function div(name) { return angular.element('<div class=' + ns + name + ' name=' + name + '></div>'); }

  function offset(element, client) {
    var top = 0, left = 0;
    while (element) {
      top += element.offsetTop || 0;
      left += element.offsetLeft || 0;
      if (client) {
        top += element.clientTop || 0;
        left += element.clientLeft || 0;
      }
      element = element.offsetParent;
    }
    return { top: top, left: left };
  };

  function alphaBg(rgb) {
    return { 
      'background-image':
        'linear-gradient(90deg,rgba(' + rgb + ',0),rgb(' + rgb + ')),' +
        'repeating-linear-gradient(45deg,#fff,#fff 3%,#ddd 3%,#ddd 6%)'
    };
  }

  function MnxColor($document) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link(scope, element, attrs, ctrl) {
        var
          mode = attrs.mode || 'h', // h, s, v
          container = div('container'),
          alpha = div('alpha'),
          lch = div('lch'),
          rch = div('rch'),
          lcur = div('lcur'),
          rcur = div('rcur'),
          acur = div('acur'),
          rgb = [0, 0, 0], hsv = [0, 0, 0], a = 1,
          x1 = 0, x2 = 1, x3 = 2, current, unwatch;

        /*if (mode === 's') {
          x1 = 1; x2 = 0; x3 = 2; 
          lch.css({ 'background-image': 'linear-gradient(0deg,#000,rgba(0,0,0,0)),linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' });
          rch.css({ 'background-image': 'linear-gradient(#fff,rgba(255,255,255,0))' });
        } else */if (mode === 'v') {
          x1 = 2; x2 = 0; x3 = 1;
          lch.css({ 'background-image': 'linear-gradient(0deg,#fff,rgba(255,255,255,0)),linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' });
          rch.css({ 'background-image': 'linear-gradient(#000,rgba(0,0,0,0))' });
        } else {
          lch.css({ 'background-image': 'linear-gradient(0deg,#000,rgba(0,0,0,0)),linear-gradient(90deg,#fff,rgba(255,255,255,0))' });
          rch.css({ 'background-image': 'linear-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' });
        }

        function pickerUpdate(x, y) {
          if (current.name === 'alpha') {
            a = x / current.width;
            acur.css({ left: x + 'px' });
          } else {
            if (current.name === 'lch') {
              hsv[x2] = x / current.width;
              hsv[x3] = (current.height - y) / current.height;
              lcur.css({ top: y + 'px', left: x + 'px' });
              rch.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], hsv[1], 1]) + ')' });
            } else if (current.name === 'rch') {
              hsv[x1] = y / current.height;
              rcur.css({ top: y + 'px' });
              lch.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], 1, 1]) + ')' });
            }
            rgb = hsvToRgb(hsv);
            alpha.css(alphaBg(rgb));
          }
          if (a < 1) {
            ctrl.$setViewValue('rgba(' + rgb + ',' + round(a * 100) / 100 + ')');
          } else {
            ctrl.$setViewValue('#' + ('00000' + ((rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16)).substr(-6));
          }
          ctrl.$render();
        }

        function inputUpdate() {
          hsv = rgbToHsv(rgb);
          lcur.css({
            top: round((lch[0].clientHeight - 1) - hsv[x3] * (lch[0].clientHeight - 1)) + 'px',
            left: round(hsv[x2] * (lch[0].clientWidth - 1)) + 'px'
          });
          rcur.css({ top: round(hsv[x1] * (rch[0].clientHeight - 1)) + 'px', left: 0 });
          acur.css({ top: 0, left: round(a * (alpha[0].clientWidth - 1)) + 'px' });
          rch.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], hsv[1], 1]) + ')' });
          lch.css({ 'background-color': 'rgb(' + hsvToRgb([hsv[0], 1, 1]) + ')' });
          alpha.css(alphaBg(rgb));
        }

        function inputParse(value, old) {
          var m;
          if (!value || value === old) { return; }
          if (m = /^#([\da-f]{3}(?:[\da-f]{3})?)$/i.exec(value)) {
            // capture the hex color value
            m = parseInt(m[1][3] ? m[1] : m[1].replace(/(.)/g, '$1$1'), 16);
            rgb = [m >> 16 & 255, m >> 8 & 255, m & 255];
            a = 1;
          } else if (m = /^(rgb|hsl)(a?)\((\d+)(%?) *, *(\d+)(%?) *, *(\d+)(%?)(?: *, *(\d*\.?\d+))?\)$/.exec(value)) {
            // capture the rgb or hsl color value
            if (m[2] ? !m[9] : m[9]) { return; }
            if (m[1] === 'hsl' && !m[4] && m[6] && m[8]) {
              rgb = hsvToRgb(hslToHsv(clamp(m[3], 360), clamp(m[5], 100), clamp(m[7], 100)));
            } else if (m[1] === 'rgb' && m[4] === m[6] && m[6] === m[8]) {
              if (m[4]) {
                m[3] = round(m[3] * 2.55);
                m[5] = round(m[5] * 2.55);
                m[7] = round(m[7] * 2.55);
              }
              rgb = [clamp(m[3], 255), clamp(m[5], 255), clamp(m[7], 255)];
            } else { return; }
            a = clamp(m[9] || 1, 1);
          } else if (value === 'transparent') {
            rgb = [0, 0, 0];
            a = 0;
          } else if (m = /^[a-z]{3,}$/i.exec(value)) {
            // capture the named color value
            alpha.css({ color: 'rgba(0,0,0,0)' });
            alpha.css({ color: m[0] });
            m = window.getComputedStyle(alpha[0]).color.match(/(\d)+/g);
            if (m.join() === '0,0,0,0') { return; }
            rgb = [+m[0], +m[1], +m[2]];
            a = 1;
          } else { return; }
          inputUpdate();
        }

        function watch() {
          unwatch = scope.$watch(attrs.ngModel, inputParse);
        }

        function mousemove(event) {
          var
            x = clamp(event.pageX - current.left, current.width),
            y = clamp(event.pageY - current.top, current.height);
          event.stopPropagation();
          event.preventDefault();
          pickerUpdate(x, y);
        }

        function mousedown(event) {
          var self = this, pos = offset(self, true);
          current = {
            name: self.getAttribute('name'),
            width: self.clientWidth - 1,
            height: self.clientHeight - 1,
            top: pos.top,
            left: pos.left
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
          var pos = offset(element[0]);
          container.css({ top: pos.top +  element[0].offsetHeight + 'px', left: pos.left + 'px' });
          angular.element(document.body).append(container);
          lch.on('mousedown', mousedown);
          rch.on('mousedown', mousedown);
          alpha.on('mousedown', mousedown);
          inputParse(ctrl.$viewValue);
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
