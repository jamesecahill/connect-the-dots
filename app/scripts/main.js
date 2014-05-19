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
	//export the def
	window.Node = Node;

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
	//export the def
	window.Edge = Edge;

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
				this.draw();
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
			this.draw();
			this.updateButtons();
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
		 * Solve the puzzle by connecting the dots with non-intersecting lines. The algorithm splits
		 * the set into an upper and lower collection of nodes, split by a middle horizontal divider.
		 * It then connects each new set from left to right, then connects those two lines to each other,
		 * forming a polygon. This will work for most cases, but there are some edges missed, see below.
		 */
		AppImpl.prototype.solve = function() {
			if (this.isDrawing && this.dotNodes.length > 1) {
				var minY = -1,
					maxY = 0,
					midY;
				var upperNodes = [];
				var lowerNodes = [];
				var n, i;

				//maintain app state
				this.isDrawing = false;

				//find dividing line between top and bottom nodes
				for (i=0; i<this.dotNodes.length; i++) {
					n = this.dotNodes[i];
					if (minY === -1 || n.y < minY) {
						minY = n.y;
					}
					if (n.y > maxY) {
						maxY = n.y;
					}
				}
				midY = minY + (maxY - minY) / 2;

				//sort node list from left to right, top to bottom
				var compareNodes = function(node1, node2) {
					if (node1.x < node2.x) {
						return -1;
					} else if (node1.x > node2.x) {
						return 1;
					} else {
						if (node1.y < node2.y) {
							return -1;
						} else if (node1.y > node2.y) {
							return 1;
						}
						return 0;
					}
				};
				this.dotNodes.sort(compareNodes);

				//split into two arrays of upper and lower nodes
				for (i=0; i<this.dotNodes.length; i++) {
					n = this.dotNodes[i];
					if (n.y > midY) {
						lowerNodes.push(n);
					} else {
						upperNodes.push(n);
					}
				}

				//connect the dots left to right
				for (i =0; i<upperNodes.length; i++) {
					if (i !== upperNodes.length - 1) {
						this.addDotEdge(upperNodes[i], upperNodes[i + 1]);
					}
				}
				for (i =0; i<lowerNodes.length; i++) {
					if (i !== lowerNodes.length - 1) {
						this.addDotEdge(lowerNodes[i], lowerNodes[i + 1]);
					}
				}

				// connect the upper and lower lines on both ends
				// NOTE: there are edge cases missed by this. if the lower nodes start well to the right there will be intersection
				//       more work needed to move the default edge placement 
				this.addDotEdge(upperNodes[0], lowerNodes[0]);
				this.addDotEdge(upperNodes[upperNodes.length - 1], lowerNodes[lowerNodes.length - 1]);
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
					n.isDrawn = true;
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
			this.updateButtons();
		};

		/**
		 * Update the state of the solve and reset buttons
		 */
		AppImpl.prototype.updateButtons = function() {
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