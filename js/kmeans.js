export class KMeans {
    constructor() {}

    cluster(points, k, iterations=20) {
        // Compute cluster labels for each point
        const iterator = this.visualize(points, k)
        let labels = []
        for (let i = 0; i < iterations; i++) {
            let result = iterator.next()
            if (result.done)
                break
            labels = result.value
        }
        return labels
    }

    * visualize(points, k) {
        // Compute cluster labels for every iteration and yield them
        const pts = points.map(p => ({x: p.x, y: p.y}))
        const centroids = this._initializeCentroids(k)
        const assignments = {}
        while (true) {
            this._updateAssignments(centroids, assignments, pts)
            this._updateCentroids(centroids, assignments, pts)
            let labels = this._assignmentsToLabels(assignments, pts)
            yield labels
        }
    }

    _getMax(points) {
        const max = Math.max
        return points.reduce((a, c) => ({x: max(a.x, c.x), y: max(a.y, c.y)}))
    }

    getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

    _initializeCentroids(k) {
        // Randomly initialize k centroids
        const indices = [...Array(k).keys()]
        const rand = this.getRandomInt
        return indices.map(_ => ({x: rand(360), y: rand(180)}))
    }

    _updateAssignments(centroids, assignments, points) {
        // Determine closest centroid for each point
        for (let c = 0; c < centroids.length; c++)
            assignments[c] = []
        for (let p = 0; p < points.length; p++) {
            let bestCentroid = -1
            let bestDistance = Infinity
            for (let c = 0; c < centroids.length; c++) {
                let d = this._distance(centroids[c], points[p])
                if (d < bestDistance) {
                    bestCentroid = c
                    bestDistance = d
                }
            }
            assignments[bestCentroid].push(p)
        }
    }

    _updateCentroids(centroids, assignments, points) {
        // Recompute centroids
        for (let c = 0; c < centroids.length; c++) {
            let nPoints = assignments[c].length
            if (nPoints == 0)
                continue
            let xSum = 0
            let ySum = 0
            for (let p = 0; p < nPoints; p++) {
                xSum += points[assignments[c][p]].x
                ySum += points[assignments[c][p]].y
            }
            centroids[c].x = xSum / nPoints
            centroids[c].y = ySum / nPoints
        }
    }

    _assignmentsToLabels(assignments, points) {
        // Concatenate assignments
        const labels = new Array(points.length).fill(0);
        for (let c in assignments) {
            assignments[c].forEach(p => {
                labels[p] = +c
            })
        }
        return labels
    }

    _distance(p1, p2) {
        // Compute distance between two points
        let dx = (p2.x - p1.x) * (p2.x - p1.x)
        let dy = (p2.y - p1.y) * (p2.y - p1.y)
        return Math.sqrt(dx + dy)
    }
}
