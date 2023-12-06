({
	onCheck: function(cmp, evt) {
		 var checkCmp = cmp.find("checkbox");
		 resultCmp = cmp.find("checkResult");
		 resultCmp.set("v.value", ""+checkCmp.get("v.value"));

	 }
})