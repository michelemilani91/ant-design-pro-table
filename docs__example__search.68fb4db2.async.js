(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[20],{"2CD1":function(e,t,a){"use strict";var n=a("ZZRV"),r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"defs",attrs:{},children:[{tag:"style",attrs:{}}]},{tag:"path",attrs:{d:"M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"}},{tag:"path",attrs:{d:"M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"}}]},name:"plus",theme:"outlined"},s=r,l=a("EcdN"),o=function(e,t){return n["createElement"](l["a"],Object.assign({},e,{ref:t,icon:s}))};o.displayName="PlusOutlined";t["a"]=n["forwardRef"](o)},gnUZ:function(e,t,a){"use strict";a.r(t);a("JP+d");for(var n=a("5uwi"),r=a("ZZRV"),s=a.n(r),l=a("2YZa"),o=a("2CD1"),i={0:"close",1:"running",2:"online",3:"error"},d=[],u=0;u<100;u+=1)d.push({key:u,name:"TradeCode ".concat(u),status:i[Math.floor(10*Math.random())%4],updatedAt:Date.now()-Math.floor(1e3*Math.random()),createdAt:Date.now()-Math.floor(2e3*Math.random()),money:Math.floor(2e3*Math.random())*u,progress:Math.ceil(100*Math.random())+1});var c=[{title:"\u6807\u9898",dataIndex:"name",render:e=>s.a.createElement("a",null,e)},{title:"\u72b6\u6001",dataIndex:"status",initialValue:"all",width:100,filters:!0,valueEnum:{all:{text:"\u5168\u90e8",status:"Default"},close:{text:"\u5173\u95ed",status:"Default"},running:{text:"\u8fd0\u884c\u4e2d",status:"Processing"},online:{text:"\u5df2\u4e0a\u7ebf",status:"Success"},error:{text:"\u5f02\u5e38",status:"Error"}}},{title:"\u521b\u5efa\u65f6\u95f4",key:"since",dataIndex:"createdAt",width:200,valueType:"dateTime"},{title:"\u66f4\u65b0\u65f6\u95f4",key:"since2",width:120,dataIndex:"createdAt",valueType:"date"},{title:"\u64cd\u4f5c",key:"option",width:120,valueType:"option",render:()=>[s.a.createElement("a",null,"\u64cd\u4f5c"),s.a.createElement("a",null,"\u5220\u9664")]}];t["default"]=()=>s.a.createElement(l["c"],{columns:c,request:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return Promise.resolve({data:d.filter(t=>!e.keyWord||!(!t.name.includes(e.keyWord)&&!t.status.includes(e.keyWord))),success:!0})},options:{search:{name:"qixian"}},rowKey:"key",pagination:{showSizeChanger:!0},size:"middle",search:!1,toolBarRender:()=>[s.a.createElement(n["a"],{type:"primary",icon:s.a.createElement(o["a"],null)},"\u65b0\u5efa")],dateFormatter:"string",headerTitle:"\u7b80\u5355\u641c\u7d22"})}}]);