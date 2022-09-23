Module.register("MMM-Suntran-Tucson", {
  defaults: {
    text: "Well, hi there!"
  },
  start() {},
  getDom() {
    var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
  }
});
