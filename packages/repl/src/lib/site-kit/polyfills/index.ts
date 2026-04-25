if (!Array.prototype.at) {
	Array.prototype.at = function (index: number) {
		return this[index >= 0 ? index : this.length + index];
	};
}

if (!Promise.withResolvers) {
	(Promise as any).withResolvers = function () {
		let resolve: any, reject: any;
		const promise = new Promise<any>((res, rej) => {
			resolve = res;
			reject = rej;
		});
		return { resolve, reject, promise };
	};
}
