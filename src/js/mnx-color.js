(function () {
  function MnxColor() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var
          h = 0, s = 1, v = 1, alpha = 1,
          container = angular.element('<div class="cp-container"></div>'),
          color = angular.element('<div class="cp-col"><div class="cp-sat"><div class="cp-val"></div></div></div>'),
          hue = angular.element('<div class="cp-hue"></div>'),
          alpha = angular.element('<div class="cp-alpha"><div class="cp-alpha-inner"></div></div>'),
          ccursor = angular.element('<div class="cp-ccursor"></div>'),
          hcursor = angular.element('<div class="cp-hcursor"></div>'),
          acursor = angular.element('<div class="cp-acursor"></div>');

        container.append(color).append(hue).append(alpha);
        color.append(ccursor).on('click', setColor);
        hue.append(hcursor).on('click', setHue);
        alpha.append(acursor).on('click', setAlpha);
        element.append(container);

        function setColor(event) {
          var
            x = event.pageX - color.prop('offsetLeft');
            y = event.pageY - color.prop('offsetTop');
          s = bound(x, 150);
          v = bound(150 - y, 150);
          ccursor.css({ top: y - 3 + 'px', left: x - 3 + 'px' });
          setAlpha();
        }

        function setHue(event) {
          var y = event.pageY - hue.prop('offsetTop');
          h = bound(y, 150);
          color.css({ 'background-color': 'rgb(' + hsvToRgb(h, 1, 1).join(',') + ')' });
          hcursor.css({ top: y - 2 + 'px', left: '-1px' });
          setAlpha();
        }

        function setAlpha(event) {
          if (event) {
            var x = event.pageX - alpha.prop('offsetLeft');
            acursor.css({ top: '-1px', left: x - 2 + 'px' });
          }
          alpha.children()[0].style.background = 'linear-gradient(to right, rgba(0,0,255,0), rgb(' + hsvToRgb(h, s, v).join(',') + ')';
        }
      }
    };

    function bound(n, max) {
      n = Math.min(max, Math.max(0, parseFloat(n)));
      if (Math.abs(n - max) < 0.000001) return 1;
      return (n % max) / parseFloat(max);
    }

    function hsvToRgb(h, s, v) {
      h = h * 6;

      var
        i = Math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

      return [r * 255|0, g * 255|0, b * 255|0];
    }
  }
  angular.module('mnxColor', []).directive('mnxColor', MnxColor);
})();
