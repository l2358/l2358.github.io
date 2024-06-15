$(function(){

	$('#logoLeft').mouseenter(function(){
		$('#logoLeftFe').animate({'top':'0px'},0)
		$('#logoLeftFe').animate({'top':'-750px'},1000)
	})

	$('.recoBtn').click(function(){
		$('#bigBox').show()
		$('#recoPage').hide()
		$('#recoPage').animate({'margin-top':'-150px','opacity':'0'},0)
	})

	$('.navBg').hide()

	$('.buy').mouseenter(function(){
		$('.navBg').hide()
		$('.navBg01').show()
		$('.navBg01 a').animate({'top':'0','bottom':'0','opacity':'1'},300)
	})

	$('.news').mouseenter(function(){
		$('.navBg').hide()
		$('.navBg02').show()
		$('.navBg02 a').animate({'top':'0','bottom':'0','opacity':'1'},300)
	})

	$('.forum').mouseenter(function(){
		$('.navBg').hide()
		$('.navBg03').show()
		$('.navBg03 a').animate({'top':'0','bottom':'0','opacity':'1'},300)
	})

	$('.tool').mouseenter(function(){
		$('.navBg').hide()
		$('.navBg04').show()
		$('.navBg04 a').animate({'top':'0','bottom':'0','opacity':'1'},300)
	})

	$('.favorites').mouseenter(function(){
		$('.navBg').hide()
		$('.navBg05').show()
		$('.navBg05 a').animate({'top':'0','bottom':'0','opacity':'1'},300)
	})

/*滑动页面*/

$.fn.hoverDelay = function(options){ 
var defaults = { 
hoverDuring: 200, 
outDuring: 200, 
hoverEvent: function(){ 
$.noop(); 
}, 
outEvent: function(){ 
$.noop(); 
} 
}; 
var sets = $.extend(defaults,options || {}); 
var hoverTimer, outTimer; 
return $(this).each(function(){ 
$(this).hover(function(){ 
clearTimeout(outTimer); 
hoverTimer = setTimeout(sets.hoverEvent, sets.hoverDuring); 
},function(){ 
clearTimeout(hoverTimer); 
outTimer = setTimeout(sets.outEvent, sets.outDuring); 
}); 
}); 
} 



$('.hZ101Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ101').show()				
		$(".hNav").removeClass("currentHNav")
		$(".hZ101Btn").addClass("currentHNav")
} 
}); 

$('.hZ102Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ102').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ102Btn").addClass("currentHNav")	
} 
}); 

$('.hZ103Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ103').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ103Btn").addClass("currentHNav")	
} 
}); 

$('.hZ104Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ104').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ104Btn").addClass("currentHNav")	
} 
}); 

$('.hZ105Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ105').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ105Btn").addClass("currentHNav")	
} 
}); 

$('.hZ106Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ106').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ106Btn").addClass("currentHNav")		
} 
}); 

$('.hZ107Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ107').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ107Btn").addClass("currentHNav")	
} 
}); 

$('.hZ108Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ108').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ108Btn").addClass("currentHNav")
} 
}); 

$('.hZ109Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ109').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ109Btn").addClass("currentHNav")	
} 
}); 

$('.hZ110Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ110').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ110Btn").addClass("currentHNav")	
} 
}); 

$('.hZ111Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ111').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ111Btn").addClass("currentHNav")	
} 
}); 

$('.hZ112Btn').hoverDelay({ 
hoverEvent: function(){ 
		$('.hSiteBox').hide()
		$('.hZ112').show()
		$(".hNav").removeClass("currentHNav")
		$(".hZ112Btn").addClass("currentHNav")	
} 
}); 


$('.promptBtn').hoverDelay({ 
hoverEvent: function(){ 
		$('.promptText').show()
} 
}); 

$('.promptBtn').mouseout(function(){
		$(".promptText").hide()
	})

$('.mSiteBtn').hoverDelay({ 
hoverEvent: function(){ 
		$('.mSiteQrcode').show()
} 
}); 

$('.mSiteBtn').mouseout(function(){
		$(".mSiteQrcode").hide()
	})
})

