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
      var y = $(this).scrollTop()
      if (y > 600) {
        $('#swiftweekly').fadeIn()
      }
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