# 个人作品网站上线步骤

## 1. 新建 Vercel 项目
- 在 Vercel 新建一个项目。
- 项目名称建议：`nanenhao-portfolio`。
- Root Directory 选择：`011/opening-prototype`
- 部署后会得到一个新的 Vercel 域名。

## 2. 新建 Supabase 项目
- 单独新建一个新的 Supabase 项目，不要复用旧的“爱情相册”。
- 项目名称建议：`nanenhao-portfolio`。

## 3. 建 Storage bucket
- 进入 Supabase Storage。
- 新建 bucket：`portfolio-assets`
- 建议设为 `Public`，这样简历图片可以直接公开访问。

## 4. 在 Storage 里准备简历路径
- 在 bucket `portfolio-assets` 中建立路径：`resume/current.jpg`
- 先手动上传一次当前简历，文件名就放这个路径。

公开地址格式：
`https://你的supabase项目域名/storage/v1/object/public/portfolio-assets/resume/current.jpg`

## 5. 新建运行时配置文件
- 把 `portfolio-runtime.example.js` 复制一份，命名为：`portfolio-runtime.js`
- 填入你的公开简历地址，例如：

```js
window.__portfolioRuntime = {
  resumeUrl: "https://your-project.supabase.co/storage/v1/object/public/portfolio-assets/resume/current.jpg",
  resumeUploadApi: "/api/upload-resume"
};
```

## 6. 在 HTML 里引入运行时配置
如果页面里还没引入 `portfolio-runtime.js`，就在 `video-homepage-preview.html` 里 `video-homepage-preview.css` 后面加：

```html
<script src="./portfolio-runtime.js"></script>
```

## 7. Vercel 环境变量
在 Vercel 项目里添加这 4 个环境变量：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`
- `SUPABASE_RESUME_PATH`

建议值：
- `SUPABASE_BUCKET=portfolio-assets`
- `SUPABASE_RESUME_PATH=resume/current.jpg`

说明：
- `SUPABASE_SERVICE_ROLE_KEY` 只放在 Vercel 环境变量里，绝对不要写到前端页面。
- 这个 key 是给 `/api/upload-resume` 服务端接口用的。

## 8. 重新部署
- 把 `portfolio-runtime.js` 一起提交部署。
- 重新触发 Vercel 部署。

## 9. 最终效果
部署完成后：
- 网页默认显示 Storage 里的线上简历
- 点击“上传新简历预览”会直接覆盖 `resume/current.jpg`
- 简历橱窗、放大预览、下载按钮会一起更新

## 10. 现在你要做的
按顺序完成这三件事：
1. 新建 Vercel 项目
2. 新建 Supabase 项目
3. 建 `portfolio-assets` bucket

做完后，把下面 3 个信息发我：
- 新的 Vercel 域名
- Supabase 项目 URL
- 公开简历地址

我再帮你把 `portfolio-runtime.js` 直接填好。
