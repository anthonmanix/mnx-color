(function () {
  function MnxColor() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var
          h = 0, s = 1, v = 1, alpha = 1,
          container = angular.element('<div class="cp-container"></div>');
          color = angular.element('<div class="cp-col"><div class="cp-sat"><div class="cp-val"></div></div></div>'),
          hue = angular.element('<div class="cp-hue"></div>'),
          alpha = angular.element('<div class="cp-alpha"><div class="cp-alpha-inner"></div></div>');

        container.append(color).append(hue).append(alpha);
        element.append(container);

        hue.on('click', function (event) {
          h = bound(event.pageY - hue[0].getBoundingClientRect().top, 150);
          color.css({ 'background-color': 'rgb(' + hsvToRgb(h, 1, 1).join(',') + ')' });
          setAlpha();
        });

        color.on('click', function (event) {
          s = bound(event.pageX - color[0].getBoundingClientRect().left, 150);
          v = bound(-(event.pageY - color[0].getBoundingClientRect().bottom), 150);
          setAlpha();
        });

        function setAlpha() {
          alpha.children().css({
            'background-image': 'linear-gradient(to right, rgba(0,0,255,0), rgb(' + hsvToRgb(h, s, v).join(',') + ')'
          });
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
