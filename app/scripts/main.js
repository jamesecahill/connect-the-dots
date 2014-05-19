$(window).ready(function() {
	
	var Node;
	// Node closure
	(function() {
		/**
		 * @constructor
		 * 
		 * Represents the data behind a node in the graph
		 */
		Node = function(x, y) {
			this.x = x;
			this.y = y;
			this.isDrawn = false;
		};
	})();

	var Edge;
	// Edge closure
	(function() {
		/**
		 * @constructor
		 * 
		 * Represents the data begind en edge between two nodes in the graph
		 */
		Edge = function(node1, node2) {
			this.node1 = node1;
			this.node2 = node2;
			this.isDrawn = false;
		};
	})();

	var AppImpl;
	// AppImpl closure
	(function() {
		// ************************
		// PRIVATES
		// ************************

		/**
		 * Size the canvas to fit the screen
		 */
		var _sizeCanvasToFit = function(canvasId) {
			var cvs = $(this.canvasId);
			cvs.css({
				"width": window.innerWidth,
				"height": window.innerHeight
			});
			cvs = cvs[0];
			var ctx = cvs.getContext("2d");
			var imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
			ctx.canvas.width = window.innerWidth;
			ctx.canvas.height = window.innerHeight;
			ctx.putImageData(imgData, 0, 0);
		};

		 /**
		  * Handle creating a new dot and rendering it if drawing is enabled
		  */
		var _handleNewDotNode = function(e) {
			if (this.isDrawing) {
				this.addDotNode(new Node(e.clientX, e.clientY));
				this.redraw();
			}
		};


		/**
		 * Handle resetting the app
		 */
		var _handleReset = function() {
			this.reset();
			this.redraw();
		};

		/**
		 * Handle solving
		 */
		var _handleSolve = function() {
			this.solve();
			this.redraw();
		};

		/**
		 * Setup the listeneres on various elements
		 */
		var _setupListeners = function() {
			$(window).resize($.proxy(_sizeCanvasToFit, this));
			$(this.canvasId).click($.proxy(_handleNewDotNode, this));
			$(this.solveButtonId).click($.proxy(_handleSolve, this));
			$(this.resetButtonId).click($.proxy(_handleReset, this));
		};

		/**
		 * @constructor
		 * 
		 * Represents the state and controlling mechanics for the dots application
		 */
		AppImpl= function(opts) {
			// PUBLIC PROPERTIES
			this.canvasId = opts.canvasId;
			this.solveButtonId = opts.solveButtonId;
			this.resetButtonId = opts.resetButtonId;
			this.isDrawing = true;
			this.dotNodes = [];
			this.dotEdges = [];

			// init
			$.proxy(_sizeCanvasToFit, this)();
			$.proxy(_setupListeners, this)();
			this.redraw();
		};

		// ************************
		// PUBLIC PROTOTYPES
		// ************************

		/**
		 * Solve the puzzle by connecting the dots with non-intersecting lines
		 */
		AppImpl.prototype.solve = function() {
			if (this.isDrawing && this.dotNodes.length > 1) {
				this.isDrawing = false;
				var n;
				for (var i=0; i<this.dotNodes.length; i++) {
					n = this.dotNodes[i];
					if (i === this.dotNodes.length - 1) {
						this.addDotEdge(n, this.dotNodes[0]);
					} else {
						this.addDotEdge(n, this.dotNodes[i + 1]);
					}
				}
			}
		};

		/**
		 * Reset the state and underlying data of the application
		 */
		AppImpl.prototype.reset = function() {
			if (!this.isDrawing) {
				this.isDrawing = true;
				this.dotNodes = [];
				this.dotEdges = [];
			}
		};

		/**
		 * Draw any new edges or nodes that have not been drawn yet
		 * @param ignoreDrawnFlags {boolean} for always drawing everytinh
		 */
		AppImpl.prototype.draw = function(ignoreDrawnFlags) {
			var n;
			var ctx = $(this.canvasId)[0].getContext("2d");
			//draw dot nodes
			for (var i=0; i<this.dotNodes.length; i++) {
				n = this.dotNodes[i];
				if (ignoreDrawnFlags || !n.isDrawn) {
					ctx.beginPath();
					ctx.arc(n.x, n.y, 5, 0, 2 * Math.PI);
					ctx.fillStyle = "#000";
					ctx.stroke();
					ctx.fill();
				}
			}
			//draw edges
			for (var j=0; j<this.dotEdges.length; j++) {
				n = this.dotEdges[j];
				if (ignoreDrawnFlags || !n.isDrawn) {
					ctx.beginPath();
					ctx.moveTo(n.node1.x, n.node1.y);
					ctx.lineTo(n.node2.x, n.node2.y);
					ctx.stroke();
				}
			}
		};

		/**
		 * Clear the canvas and redraw everything, also update the button states
		 */
		AppImpl.prototype.redraw = function() {
			//clear canvas
			var cvs = $(this.canvasId)[0];
			var ctx = cvs.getContext("2d");
			ctx.clearRect(0, 0, cvs.width, cvs.height);

			//draw nodes and edges, ignoring if they've been marked as drawn before
			this.draw(true);

			//update buttons
			if (this.isDrawing) {
				$(this.solveButtonId).show();
				$(this.resetButtonId).hide();
			} else {
				$(this.solveButtonId).hide();
				$(this.resetButtonId).show();
			}
		};

		/**
		 * Add a dot node to the underlying data
		 * @param {object} the node to add
		 */
		AppImpl.prototype.addDotNode = function(node) {
			this.dotNodes.push(node);
		};

		/**
		 * Create en edge between the two nodes and add it to the underlying data
		 * @param {object} the first node
		 * @param {object} the second node
		 */
		AppImpl.prototype.addDotEdge = function(node1, node2) {
			this.dotEdges.push(new Edge(node1, node2));
		};
	})();

	// Wire-up the application to items in the dom and initialize it
	window.DotsApplication = new AppImpl({
		"canvasId": "#dots-canvas",
		"solveButtonId": "#btn-solve",
		"resetButtonId": "#btn-reset"
	});
});