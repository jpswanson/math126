// Generated by CoffeeScript 1.6.3
/*
@author alteredq / http://alteredqualia.com/

Port of greggman's ThreeD version of marching cubes to Three.js
http://webglsamples.googlecode.com/hg/blob/blob.html
*/


(function() {
  THREE.MarchingCubes = function(resolution, material, enableUvs, enableColors) {
    THREE.ImmediateRenderObject.call(this);
    this.material = material;
    this.enableUvs = (enableUvs !== undefined ? enableUvs : false);
    this.enableColors = (enableColors !== undefined ? enableColors : false);
    this.init = function(resolution) {
      this.resolution = resolution;
      this.isolation = 80.0;
      this.size = resolution;
      this.size2 = this.size * this.size;
      this.size3 = this.size2 * this.size;
      this.halfsize = this.size / 2.0;
      this.delta = 2.0 / this.size;
      this.yd = this.size;
      this.zd = this.size2;
      this.field = new Float32Array(this.size3);
      this.normal_cache = new Float32Array(this.size3 * 3);
      this.vlist = new Float32Array(12 * 3);
      this.nlist = new Float32Array(12 * 3);
      this.firstDraw = true;
      this.maxCount = 4096;
      this.count = 0;
      this.hasPositions = false;
      this.hasNormals = false;
      this.hasColors = false;
      this.hasUvs = false;
      this.positionArray = new Float32Array(this.maxCount * 3);
      this.normalArray = new Float32Array(this.maxCount * 3);
      if (this.enableUvs) {
        this.uvArray = new Float32Array(this.maxCount * 2);
      }
      if (this.enableColors) {
        this.colorArray = new Float32Array(this.maxCount * 3);
      }
    };
    this.lerp = function(a, b, t) {
      return a + (b - a) * t;
    };
    this.VIntX = function(q, pout, nout, offset, isol, x, y, z, valp1, valp2) {
      var mu, nc;
      mu = (isol - valp1) / (valp2 - valp1);
      nc = this.normal_cache;
      pout[offset] = x + mu * this.delta;
      pout[offset + 1] = y;
      pout[offset + 2] = z;
      nout[offset] = this.lerp(nc[q], nc[q + 3], mu);
      nout[offset + 1] = this.lerp(nc[q + 1], nc[q + 4], mu);
      nout[offset + 2] = this.lerp(nc[q + 2], nc[q + 5], mu);
    };
    this.VIntY = function(q, pout, nout, offset, isol, x, y, z, valp1, valp2) {
      var mu, nc, q2;
      mu = (isol - valp1) / (valp2 - valp1);
      nc = this.normal_cache;
      pout[offset] = x;
      pout[offset + 1] = y + mu * this.delta;
      pout[offset + 2] = z;
      q2 = q + this.yd * 3;
      nout[offset] = this.lerp(nc[q], nc[q2], mu);
      nout[offset + 1] = this.lerp(nc[q + 1], nc[q2 + 1], mu);
      nout[offset + 2] = this.lerp(nc[q + 2], nc[q2 + 2], mu);
    };
    this.VIntZ = function(q, pout, nout, offset, isol, x, y, z, valp1, valp2) {
      var mu, nc, q2;
      mu = (isol - valp1) / (valp2 - valp1);
      nc = this.normal_cache;
      pout[offset] = x;
      pout[offset + 1] = y;
      pout[offset + 2] = z + mu * this.delta;
      q2 = q + this.zd * 3;
      nout[offset] = this.lerp(nc[q], nc[q2], mu);
      nout[offset + 1] = this.lerp(nc[q + 1], nc[q2 + 1], mu);
      nout[offset + 2] = this.lerp(nc[q + 2], nc[q2 + 2], mu);
    };
    this.compNorm = function(q) {
      var q3;
      q3 = q * 3;
      if (this.normal_cache[q3] === 0.0) {
        this.normal_cache[q3] = this.field[q - 1] - this.field[q + 1];
        this.normal_cache[q3 + 1] = this.field[q - this.yd] - this.field[q + this.yd];
        this.normal_cache[q3 + 2] = this.field[q - this.zd] - this.field[q + this.zd];
      }
    };
    this.polygonize = function(fx, fy, fz, q, isol, renderCallback) {
      var bits, cubeindex, d, field0, field1, field2, field3, field4, field5, field6, field7, fx2, fy2, fz2, i, numtris, o1, o2, o3, q1, q1y, q1yz, q1z, qy, qyz, qz;
      q1 = q + 1;
      qy = q + this.yd;
      qz = q + this.zd;
      q1y = q1 + this.yd;
      q1z = q1 + this.zd;
      qyz = q + this.yd + this.zd;
      q1yz = q1 + this.yd + this.zd;
      cubeindex = 0;
      field0 = this.field[q];
      field1 = this.field[q1];
      field2 = this.field[qy];
      field3 = this.field[q1y];
      field4 = this.field[qz];
      field5 = this.field[q1z];
      field6 = this.field[qyz];
      field7 = this.field[q1yz];
      if (field0 < isol) {
        cubeindex |= 1;
      }
      if (field1 < isol) {
        cubeindex |= 2;
      }
      if (field2 < isol) {
        cubeindex |= 8;
      }
      if (field3 < isol) {
        cubeindex |= 4;
      }
      if (field4 < isol) {
        cubeindex |= 16;
      }
      if (field5 < isol) {
        cubeindex |= 32;
      }
      if (field6 < isol) {
        cubeindex |= 128;
      }
      if (field7 < isol) {
        cubeindex |= 64;
      }
      bits = THREE.edgeTable[cubeindex];
      if (bits === 0) {
        return 0;
      }
      d = this.delta;
      fx2 = fx + d;
      fy2 = fy + d;
      fz2 = fz + d;
      if (bits & 1) {
        this.compNorm(q);
        this.compNorm(q1);
        this.VIntX(q * 3, this.vlist, this.nlist, 0, isol, fx, fy, fz, field0, field1);
      }
      if (bits & 2) {
        this.compNorm(q1);
        this.compNorm(q1y);
        this.VIntY(q1 * 3, this.vlist, this.nlist, 3, isol, fx2, fy, fz, field1, field3);
      }
      if (bits & 4) {
        this.compNorm(qy);
        this.compNorm(q1y);
        this.VIntX(qy * 3, this.vlist, this.nlist, 6, isol, fx, fy2, fz, field2, field3);
      }
      if (bits & 8) {
        this.compNorm(q);
        this.compNorm(qy);
        this.VIntY(q * 3, this.vlist, this.nlist, 9, isol, fx, fy, fz, field0, field2);
      }
      if (bits & 16) {
        this.compNorm(qz);
        this.compNorm(q1z);
        this.VIntX(qz * 3, this.vlist, this.nlist, 12, isol, fx, fy, fz2, field4, field5);
      }
      if (bits & 32) {
        this.compNorm(q1z);
        this.compNorm(q1yz);
        this.VIntY(q1z * 3, this.vlist, this.nlist, 15, isol, fx2, fy, fz2, field5, field7);
      }
      if (bits & 64) {
        this.compNorm(qyz);
        this.compNorm(q1yz);
        this.VIntX(qyz * 3, this.vlist, this.nlist, 18, isol, fx, fy2, fz2, field6, field7);
      }
      if (bits & 128) {
        this.compNorm(qz);
        this.compNorm(qyz);
        this.VIntY(qz * 3, this.vlist, this.nlist, 21, isol, fx, fy, fz2, field4, field6);
      }
      if (bits & 256) {
        this.compNorm(q);
        this.compNorm(qz);
        this.VIntZ(q * 3, this.vlist, this.nlist, 24, isol, fx, fy, fz, field0, field4);
      }
      if (bits & 512) {
        this.compNorm(q1);
        this.compNorm(q1z);
        this.VIntZ(q1 * 3, this.vlist, this.nlist, 27, isol, fx2, fy, fz, field1, field5);
      }
      if (bits & 1024) {
        this.compNorm(q1y);
        this.compNorm(q1yz);
        this.VIntZ(q1y * 3, this.vlist, this.nlist, 30, isol, fx2, fy2, fz, field3, field7);
      }
      if (bits & 2048) {
        this.compNorm(qy);
        this.compNorm(qyz);
        this.VIntZ(qy * 3, this.vlist, this.nlist, 33, isol, fx, fy2, fz, field2, field6);
      }
      cubeindex <<= 4;
      o1 = void 0;
      o2 = void 0;
      o3 = void 0;
      numtris = 0;
      i = 0;
      while (THREE.triTable[cubeindex + i] !== -1) {
        o1 = cubeindex + i;
        o2 = o1 + 1;
        o3 = o1 + 2;
        this.posnormtriv(this.vlist, this.nlist, 3 * THREE.triTable[o1], 3 * THREE.triTable[o2], 3 * THREE.triTable[o3], renderCallback);
        i += 3;
        numtris++;
      }
      return numtris;
    };
    this.posnormtriv = function(pos, norm, o1, o2, o3, renderCallback) {
      var c, d;
      c = this.count * 3;
      this.positionArray[c] = pos[o1];
      this.positionArray[c + 1] = pos[o1 + 1];
      this.positionArray[c + 2] = pos[o1 + 2];
      this.positionArray[c + 3] = pos[o2];
      this.positionArray[c + 4] = pos[o2 + 1];
      this.positionArray[c + 5] = pos[o2 + 2];
      this.positionArray[c + 6] = pos[o3];
      this.positionArray[c + 7] = pos[o3 + 1];
      this.positionArray[c + 8] = pos[o3 + 2];
      this.normalArray[c] = norm[o1];
      this.normalArray[c + 1] = norm[o1 + 1];
      this.normalArray[c + 2] = norm[o1 + 2];
      this.normalArray[c + 3] = norm[o2];
      this.normalArray[c + 4] = norm[o2 + 1];
      this.normalArray[c + 5] = norm[o2 + 2];
      this.normalArray[c + 6] = norm[o3];
      this.normalArray[c + 7] = norm[o3 + 1];
      this.normalArray[c + 8] = norm[o3 + 2];
      if (this.enableUvs) {
        d = this.count * 2;
        this.uvArray[d] = pos[o1];
        this.uvArray[d + 1] = pos[o1 + 2];
        this.uvArray[d + 2] = pos[o2];
        this.uvArray[d + 3] = pos[o2 + 2];
        this.uvArray[d + 4] = pos[o3];
        this.uvArray[d + 5] = pos[o3 + 2];
      }
      if (this.enableColors) {
        this.colorArray[c] = pos[o1];
        this.colorArray[c + 1] = pos[o1 + 1];
        this.colorArray[c + 2] = pos[o1 + 2];
        this.colorArray[c + 3] = pos[o2];
        this.colorArray[c + 4] = pos[o2 + 1];
        this.colorArray[c + 5] = pos[o2 + 2];
        this.colorArray[c + 6] = pos[o3];
        this.colorArray[c + 7] = pos[o3 + 1];
        this.colorArray[c + 8] = pos[o3 + 2];
      }
      this.count += 3;
      if (this.count >= this.maxCount - 3) {
        this.hasPositions = true;
        this.hasNormals = true;
        if (this.enableUvs) {
          this.hasUvs = true;
        }
        if (this.enableColors) {
          this.hasColors = true;
        }
        renderCallback(this);
      }
    };
    this.begin = function() {
      this.count = 0;
      this.hasPositions = false;
      this.hasNormals = false;
      this.hasUvs = false;
      this.hasColors = false;
    };
    this.end = function(renderCallback) {
      var i;
      if (this.count === 0) {
        return;
      }
      i = this.count * 3;
      while (i < this.positionArray.length) {
        this.positionArray[i] = 0.0;
        i++;
      }
      this.hasPositions = true;
      this.hasNormals = true;
      if (this.enableUvs) {
        this.hasUvs = true;
      }
      if (this.enableColors) {
        this.hasColors = true;
      }
      renderCallback(this);
    };
    this.addBall = function(ballx, bally, ballz, strength, subtract) {
      var fx, fy, fy2, fz, fz2, max_x, max_y, max_z, min_x, min_y, min_z, radius, val, x, xs, y, y_offset, ys, z, z_offset, zs;
      radius = this.size * Math.sqrt(strength / subtract);
      zs = ballz * this.size;
      ys = bally * this.size;
      xs = ballx * this.size;
      min_z = Math.floor(zs - radius);
      if (min_z < 1) {
        min_z = 1;
      }
      max_z = Math.floor(zs + radius);
      if (max_z > this.size - 1) {
        max_z = this.size - 1;
      }
      min_y = Math.floor(ys - radius);
      if (min_y < 1) {
        min_y = 1;
      }
      max_y = Math.floor(ys + radius);
      if (max_y > this.size - 1) {
        max_y = this.size - 1;
      }
      min_x = Math.floor(xs - radius);
      if (min_x < 1) {
        min_x = 1;
      }
      max_x = Math.floor(xs + radius);
      if (max_x > this.size - 1) {
        max_x = this.size - 1;
      }
      x = void 0;
      y = void 0;
      z = void 0;
      y_offset = void 0;
      z_offset = void 0;
      fx = void 0;
      fy = void 0;
      fz = void 0;
      fz2 = void 0;
      fy2 = void 0;
      val = void 0;
      z = min_z;
      while (z < max_z) {
        z_offset = this.size2 * z;
        fz = z / this.size - ballz;
        fz2 = fz * fz;
        y = min_y;
        while (y < max_y) {
          y_offset = z_offset + this.size * y;
          fy = y / this.size - bally;
          fy2 = fy * fy;
          x = min_x;
          while (x < max_x) {
            fx = x / this.size - ballx;
            val = strength / (0.000001 + fx * fx + fy2 + fz2) - subtract;
            if (val > 0.0) {
              this.field[y_offset + x] += val;
            }
            x++;
          }
          y++;
        }
        z++;
      }
    };
    this.addPlaneX = function(strength, subtract) {
      var cxy, dist, field, size, val, x, xdiv, xx, y, yd, z, zd;
      x = void 0;
      y = void 0;
      z = void 0;
      xx = void 0;
      val = void 0;
      xdiv = void 0;
      cxy = void 0;
      size = this.size;
      yd = this.yd;
      zd = this.zd;
      field = this.field;
      dist = size * Math.sqrt(strength / subtract);
      if (dist > size) {
        dist = size;
      }
      x = 0;
      while (x < dist) {
        xdiv = x / size;
        xx = xdiv * xdiv;
        val = strength / (0.0001 + xx) - subtract;
        if (val > 0.0) {
          y = 0;
          while (y < size) {
            cxy = x + y * yd;
            z = 0;
            while (z < size) {
              field[zd * z + cxy] += val;
              z++;
            }
            y++;
          }
        }
        x++;
      }
    };
    this.addPlaneY = function(strength, subtract) {
      var cxy, cy, dist, field, size, val, x, y, yd, ydiv, yy, z, zd;
      x = void 0;
      y = void 0;
      z = void 0;
      yy = void 0;
      val = void 0;
      ydiv = void 0;
      cy = void 0;
      cxy = void 0;
      size = this.size;
      yd = this.yd;
      zd = this.zd;
      field = this.field;
      dist = size * Math.sqrt(strength / subtract);
      if (dist > size) {
        dist = size;
      }
      y = 0;
      while (y < dist) {
        ydiv = y / size;
        yy = ydiv * ydiv;
        val = strength / (0.0001 + yy) - subtract;
        if (val > 0.0) {
          cy = y * yd;
          x = 0;
          while (x < size) {
            cxy = cy + x;
            z = 0;
            while (z < size) {
              field[zd * z + cxy] += val;
              z++;
            }
            x++;
          }
        }
        y++;
      }
    };
    this.addPlaneZ = function(strength, subtract) {
      var cyz, cz, dist, field, size, val, x, y, yd, z, zd, zdiv, zz;
      x = void 0;
      y = void 0;
      z = void 0;
      zz = void 0;
      val = void 0;
      zdiv = void 0;
      cz = void 0;
      cyz = void 0;
      size = this.size;
      yd = this.yd;
      zd = this.zd;
      field = this.field;
      dist = size * Math.sqrt(strength / subtract);
      if (dist > size) {
        dist = size;
      }
      z = 0;
      while (z < dist) {
        zdiv = z / size;
        zz = zdiv * zdiv;
        val = strength / (0.0001 + zz) - subtract;
        if (val > 0.0) {
          cz = zd * z;
          y = 0;
          while (y < size) {
            cyz = cz + y * yd;
            x = 0;
            while (x < size) {
              field[cyz + x] += val;
              x++;
            }
            y++;
          }
        }
        z++;
      }
    };
    this.reset = function() {
      var i;
      i = void 0;
      i = 0;
      while (i < this.size3) {
        this.normal_cache[i * 3] = 0.0;
        this.field[i] = 0.0;
        i++;
      }
    };
    this.render = function(renderCallback) {
      var fx, fy, fz, q, smin2, x, y, y_offset, z, z_offset;
      this.begin();
      q = void 0;
      x = void 0;
      y = void 0;
      z = void 0;
      fx = void 0;
      fy = void 0;
      fz = void 0;
      y_offset = void 0;
      z_offset = void 0;
      smin2 = this.size - 2;
      z = 1;
      while (z < smin2) {
        z_offset = this.size2 * z;
        fz = (z - this.halfsize) / this.halfsize;
        y = 1;
        while (y < smin2) {
          y_offset = z_offset + this.size * y;
          fy = (y - this.halfsize) / this.halfsize;
          x = 1;
          while (x < smin2) {
            fx = (x - this.halfsize) / this.halfsize;
            q = y_offset + x;
            this.polygonize(fx, fy, fz, q, this.isolation, renderCallback);
            x++;
          }
          y++;
        }
        z++;
      }
      this.end(renderCallback);
    };
    this.generateGeometry = function() {
      var geo, geo_callback, normals, start;
      start = 0;
      geo = new THREE.Geometry();
      normals = [];
      geo_callback = function(object) {
        var a, b, c, face, i, na, nb, nc, nfaces, normal, vertex, x, y, z;
        i = void 0;
        x = void 0;
        y = void 0;
        z = void 0;
        vertex = void 0;
        normal = void 0;
        face = void 0;
        a = void 0;
        b = void 0;
        c = void 0;
        na = void 0;
        nb = void 0;
        nc = void 0;
        nfaces = void 0;
        i = 0;
        while (i < object.count) {
          a = i * 3;
          b = a + 1;
          c = a + 2;
          x = object.positionArray[a];
          y = object.positionArray[b];
          z = object.positionArray[c];
          vertex = new THREE.Vector3(x, y, z);
          x = object.normalArray[a];
          y = object.normalArray[b];
          z = object.normalArray[c];
          normal = new THREE.Vector3(x, y, z);
          normal.normalize();
          geo.vertices.push(vertex);
          normals.push(normal);
          i++;
        }
        nfaces = object.count / 3;
        i = 0;
        while (i < nfaces) {
          a = (start + i) * 3;
          b = a + 1;
          c = a + 2;
          na = normals[a];
          nb = normals[b];
          nc = normals[c];
          face = new THREE.Face3(a, b, c, [na, nb, nc]);
          geo.faces.push(face);
          i++;
        }
        start += nfaces;
        object.count = 0;
      };
      this.render(geo_callback);
      return geo;
    };
    this.init(resolution);
  };

  THREE.MarchingCubes.prototype = Object.create(THREE.ImmediateRenderObject.prototype);

  THREE.edgeTable = new Int32Array([0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00, 0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90, 0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30, 0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac, 0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0, 0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60, 0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc, 0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0, 0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950, 0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc, 0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0, 0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc, 0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0, 0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650, 0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0, 0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460, 0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0, 0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230, 0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190, 0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0]);

  THREE.triTable = new Int32Array([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1, 3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1, 3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1, 9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, 9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1, 8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1, 9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1, 3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1, 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1, 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1, 4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1, 5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1, 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1, 9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1, 0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1, 10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1, 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1, 5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, 9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1, 0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1, 1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1, 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1, 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1, 2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, 7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1, 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1, 11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1, 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1, 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1, 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1, 11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, 1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1, 9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1, 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1, 2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1, 6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1, 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1, 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1, 6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1, 6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1, 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1, 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1, 3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1, 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1, 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1, 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1, 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1, 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1, 10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, 10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1, 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1, 1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1, 0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, 10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1, 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1, 3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1, 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1, 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1, 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1, 3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1, 6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1, 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1, 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1, 10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1, 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1, 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1, 7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1, 7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1, 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1, 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1, 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1, 8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1, 0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1, 7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, 10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, 2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1, 7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1, 2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1, 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1, 10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1, 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1, 0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1, 7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1, 6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1, 8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1, 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1, 6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1, 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1, 10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1, 8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, 0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1, 1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1, 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1, 10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1, 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1, 10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, 5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1, 9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1, 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1, 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1, 7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1, 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1, 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1, 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1, 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1, 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1, 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1, 6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1, 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1, 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1, 6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1, 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1, 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1, 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1, 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1, 9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1, 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1, 1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1, 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1, 0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1, 5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1, 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1, 11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1, 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1, 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1, 2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1, 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1, 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1, 1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1, 9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1, 9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1, 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1, 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1, 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1, 0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1, 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1, 9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1, 5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1, 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1, 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1, 8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1, 0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1, 9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1, 1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1, 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1, 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1, 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1, 11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1, 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1, 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1, 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1, 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1, 1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1, 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1, 4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1, 0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1, 3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1, 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1, 0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1, 9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1, 1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);

}).call(this);