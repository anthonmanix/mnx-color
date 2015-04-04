(function () {
  function MnxColor($document) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var
          h = 0, s = 1, v = 1, a = 0, current,
          container = angular.element('<div class="cp-container"></div>'),
          color = angular.element('<div class="cp-col"><div class="cp-sat"><div class="cp-val"></div></div></div>'),
          hue = angular.element('<div class="cp-hue"></div>'),
          alpha = angular.element('<div class="cp-alpha"><div class="cp-alpha-inner"></div></div>'),
          ccursor = angular.element('<div class="cp-ccursor"></div>'),
          hcursor = angular.element('<div class="cp-hcursor"></div>'),
          acursor = angular.element('<div class="cp-acursor"></div>');

        container.append(color).append(hue).append(alpha);
        color.append(ccursor).on('mousedown', mousedown);
        hue.append(hcursor).on('mousedown', mousedown);
        alpha.append(acursor).on('mousedown', mousedown);
        element.append(container);

        ccursor.css({ top: 0, left: 0 });
        hcursor.css({ top: 0, left: 0 });
        acursor.css({ top: 0, left: 0 });

        function mousedown(event) {
          current = {
            name: angular.element(this).prop('className'),
            width: angular.element(this).prop('clientWidth') - 1,
            height: angular.element(this).prop('clientHeight') - 1,
            top: angular.element(this).prop('offsetTop'),
            left: angular.element(this).prop('offsetLeft')
          }
          mousemove(event);
          $document.on('mousemove', mousemove).on('mouseup', function mouseup() {
            $document.off('mousemove', mousemove).off('mouseup', mouseup);
          });
        }

        function mousemove(event) {
          var
            x = Math.min(current.width, Math.max(0, event.pageX - current.left)),
            y = Math.min(current.height, Math.max(0, event.pageY - current.top));
          event.stopPropagation();
          event.preventDefault();
          setColor(x, y);
        }

        function setColor(x, y) {
          if (current.name === 'cp-col') {
            s = bound(x, current.width);
            v = bound(current.height - y, current.height);
            ccursor.css({ top: y + 'px', left: x + 'px' });
          } else if (current.name === 'cp-hue') {
            h = bound(y, current.height);
            hcursor.css({ top: y + 'px' });
            color.css({ 'background-color': 'rgb(' + hsvToRgb(h, 1, 1).join(',') + ')' });
          } else if (current.name === 'cp-alpha') {
            acursor.css({ left: x + 'px' });
          }
          alpha.children().css({ color: 'rgb(' + hsvToRgb(h, s, v) + ')' });
        }
      }
    };

    function bound(n, max) {
      if (Math.abs(n - max) < 0.000001) return 1;
      return (n % max) / parseFloat(max);
    }

    function hsvToRgb(h, s, v) {
      h = h * 6;
      var
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
  }
  MnxColor.$inject = ['$document'];
  angular.module('mnxColor', []).directive('mnxColor', MnxColor);
})();
