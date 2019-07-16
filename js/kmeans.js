export class KMeans {
    constructor() {
        this.scale = 1
    }

    compute(points, k, normalize=false, iterations=20) {
        // Compute cluster labels for each point
        if (normalize)
            this.normalizePoints(points)
        else
            this.setScale(points)

        const centroids = []
        this.initializeCentroids(centroids, k)

        const assignments = {}
        for (let i = 0; i < iterations; i++) {
            this.findClosest(centroids, assignments, points)
            this.updateCentroids(centroids, assignments, points)
        }
        return this.concatenateAssignments(assignments, points)
    }

    getMaxMin(points) {
        let xMax = 0
        let yMax = 0
        points.forEach(point => {
            if (point.x > xMax)
                xMax = point.x
            if (point.y > yMax)
                yMax = point.y
        })
        return {x: xMax, y: yMax}
    }

    setScale(points) {
        const max = this.getMaxMin(points)
        this.scale = Math.log10(max.x)
    }

    normalizePoints(points) {
        const max = this.getMaxMin(points)        
        points.forEach(point => {
            point.x = point.x / max.x
            point.y = point.y / max.y
        })
    }

    initializeCentroids(centroids, k) {
        // Randomly initialize k centroids
        for (let i = 0; i < k; i++) {
            let x = Math.random() * this.scale
            let y = Math.random() * this.scale
            centroids.push({x: x, y: y})
        }
    }

    findClosest(centroids, assignments, points) {
        // Determine closest centroid for each point
        for (let c = 0; c < centroids.length; c++)
            assignments[c] = []
        for (let p = 0; p < points.length; p++) {
            let bestCentroid = -1
            let bestDistance = Infinity
            for (let c = 0; c < centroids.length; c++) {
                let d = this.distance(centroids[c], points[p])
                if (d < bestDistance) {
                    bestCentroid = c
                    bestDistance = d
                }
            }
            assignments[bestCentroid].push(p)
        }
    }

    updateCentroids(centroids, assignments, points) {
        // Recompute centroids
        for (let c = 0; c < centroids.length; c++) {
            let nPoints = assignments[c].length
            if (nPoints == 0)
                continue
            let xSum = 0
            let ySum = 0
            for (let p = 0; p < nPoints; p++) {
                xSum += points[p].x
                ySum += points[p].y
            }
            centroids[c].x = xSum / nPoints
            centroids[c].y = ySum / nPoints
        }
    }

    concatenateAssignments(assignments, points) {
        // Concatenate assignments
        const labels = new Array(points.length).fill(0);
        for (let c in assignments) {
            assignments[c].forEach(p => {
                labels[p] = +c
            })
        }
        return labels
    }

    distance(p1, p2) {
        // Compute distance between two points
        let dx = (p2.x - p1.x) * (p2.x - p1.x)
        let dy = (p2.y - p1.y) * (p2.y - p1.y)
        return Math.sqrt(dx + dy)
    }
}