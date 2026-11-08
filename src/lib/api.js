function serviceUrl(value, fallback, suffix = "") {
  let url = value || fallback;
  if (!/^https?:\/\//i.test(url)) {
    url = `${url.startsWith("localhost") ? "http" : "https"}://${url}`;
  }
  url = url.replace(/\/+$/, "");
  if (suffix && !url.endsWith(suffix)) url += suffix;
  return url;
}

const API = serviceUrl(
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:5000/api",
  "/api"
);

export async function api(path,options={}){const response=await fetch(`${API}${path}`,{...options,credentials:"include",headers:{"Content-Type":"application/json",...options.headers}});const body=await response.json().catch(()=>({success:false,message:"Network response was invalid"}));if(!response.ok||body.success===false)throw new Error(body.message||"Request failed");return body.data;}
