$(function() {
  var checker = localStorage.getItem("swiftweeklysubscribed")
  if (checker) {
    return
  } else {
    function checkemail(val) {
      if (!val.trim()) {
        return false
      }
      var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
      return re.test(val)
    }
    $(document).scroll(function() {
      checker = localStorage.getItem("swiftweeklysubscribed")
      if (checker) {
        return
      }
      var body = document.body
      var html = document.documentElement
      var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
      var y = $(this).scrollTop()
      if (y > height * 0.618 ) {
        $('#swiftweekly').fadeIn()
      }
    })
    $("#closeme").click(function() {
      $("#swiftweekly").remove();
    })
    $(".sw_sub").click(function() {
      $("#swiftweekly #content").submit()
    })
    $("#swiftweekly #content").submit(function(e) {
      e.preventDefault()
      if (!checkemail($("#sw_email").val())) {
        setTimeout('$("#sw_email").focus()', 100)
        return
      }
      $("#sw_email").addClass("disabled")
      $(".sw_sub").addClass("disabled").text("稍等")
      $.getJSON("http://ggchecker.githuber.info/addemail/" + $("#swiftweekly #sw_email").val().trim(), function(data) {
        if (data["success"] == "success") {
          localStorage.setItem("swiftweeklysubscribed", true)
          $(".sw_sub").text("成功！")
          setTimeout("$('#swiftweekly').fadeOut()", 1000);
        }
      })
    })
  }
})

// common tasks
$(function(){
  $("img").closest("p").css({"text-align": "center"})
})

// min-height
$(window).resize(function() {
  $('#container').css({'min-height': $('html').height() - $('header').outerHeight(true) - $('footer').outerHeight(true)})
})

$(window).trigger('resize')

$(function() {
  $("input[type='search']").keyup(function(e) {
    if(e.which === 13){
      $(this).closest("form").submit();
    } 
  })
})

$(function() {
  if (window.location.pathname != '/') {
    return
  }
  function openArticle(e) {
    e.preventDefault()
    $(this).closest(".article-content").find(".article-more-link a")[0].click()
  }
  $(".article-content p").not('.article-more-link').css({'cursor': 'pointer'}).click(openArticle)
  $(".article-content p").not('.article-more-link').find('a').click(openArticle)
})

$(function() {
  $("#totop").css({"left": $("#asidepart").offset().left})
  var threadhold = $('#asidepart').offset().top + $('#asidepart').outerHeight()
  if ($('#asidepart').css('float') == 'none') {
    return
  }
  $(window).on('scroll', function() {
    if ($('body').scrollTop() + $(window).height() >= threadhold) {
      if ($('#asidepart').css('position') == 'fixed') {
        return
      }
      $('#asidepart').css({'margin': $('#asidepart').css('margin'), 'width': $('#asidepart').width(), 'position': 'fixed', 'bottom': '0', "left": $("#asidepart").position().left + 'px'})
    }
    else {
      $('#asidepart').css({'width': '18%', 'position': 'relative', 'bottom': 'auto', 'left': 'auto'})
    }
  })
})