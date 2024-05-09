webgl 画图的正确姿势
1. 绑定 vao
2. enableVertexAttribArray
3. 绑定 buffer
4. vertexAttribPointer
5. 设置 uniform, 比如纹理(记得要 useProgram)
6. 生成纹理并 bindData, 可以在前面任意一步进行
7. gl.activeTexture(gl.TEXTURE0 + index), gl.bindTexture(gl.TEXTURE_2D, this.texture), index 要和
之前纹理的 uniform 变量对应上
8. 如果有 frameBuffer, 绑定 frameBuffer
9. useProgram
10. 绑定 vao
11. clearColor, clear, viewPort, drwaArray
