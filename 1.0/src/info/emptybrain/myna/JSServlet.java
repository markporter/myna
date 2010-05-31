package info.emptybrain.myna;

import java.io.*;
import java.net.URI;
import javax.servlet.*;
import javax.servlet.http.*;
import org.mozilla.javascript.*;
import java.util.*;
import java.util.regex.*;
import java.sql.*;
import org.apache.jcs.*;
import org.apache.jcs.engine.behavior.*;
import org.apache.commons.pool.impl.*;
import org.apache.commons.dbcp.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory; 

/**
* This servlet handles handles MynaThreads
*
*/
public class JSServlet extends HttpServlet {
	 public String type="GET";
	 public void init(ServletConfig config) throws ServletException {
				// Store the ServletConfig object and log the initialization
				super.init(config);
				ServletContext sc = config.getServletContext();
				new CronThread();
				try{
					MynaThread thread = new MynaThread();
					thread.environment.put("servlet",this);
					thread.rootDir = new File(sc.getRealPath("/")).toURI().toString();
					Properties props = new Properties();
					props.load(getClass().getResourceAsStream("/general.properties"));
					if (props.getProperty("webroot") != null){
						thread.rootDir = props.getProperty("webroot");
						
					}
					try {
						String [] serverStartScripts = props.getProperty("server_start_scripts").split(",");
						
						URI sharedPath = new URI(thread.rootDir).resolve("shared/js/");
						for (int x=0;x < serverStartScripts.length;++x){
							String path = serverStartScripts[x];
							URI curUri = new java.net.URI(path);
							if (!curUri.isAbsolute()){
								curUri = sharedPath.resolve(curUri);
							}
							if (!curUri.isAbsolute() || !new File(curUri).exists()){
								throw new IOException("Cannot find '" +path +"' in system root directory or in '"
								+sharedPath.toString() 
								+"'. See server_start_scripts in WEB-INF/classes/general.properties.");	
							}
							thread.handleRequest(curUri.toString());
						}
						//thread.rootUrl = req.getContextPath() + "/";
					} catch(Exception threadException){
						thread.handleError(threadException);
					}
					
				} catch (Exception e){
					sc.log(e.toString());
					System.out.println("============== Error ============");
					System.out.println("============== Stacktrace ============");
					
					e.printStackTrace(System.out);
					e.printStackTrace(System.err);
					
				}
				
				sc.log("======================= myna init complete ===========================");
		}

	/**
	* Servlet entry point for get http method. 
	* 
	*
	* @param  req Servlet request object
	* @param  res Servlet response object
	*/
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException{
    try{
			MynaThread thread = new MynaThread();
			thread.environment.put("request",req);
			thread.environment.put("response",res);
			thread.environment.put("servlet",this);
			String servletPath = req.getServletPath();
			if (
					req.getAttribute("javax.servlet.forward.servlet_path") != null
			){
				servletPath =(String) req.getAttribute("javax.servlet.forward.servlet_path"); 
				thread.environment.put("requestURI", servletPath);
			} else {
				if (servletPath.length() ==0){
					servletPath = req.getRequestURI().substring(req.getContextPath().length()); 	
				}
				thread.environment.put("requestURI",req.getRequestURI());
			}
			thread.environment.put("requestURL",req.getRequestURL());
			
			if (thread.generalProperties.get("webroot") == null){
				thread.rootDir = new File(this.getServletContext().getRealPath("/")).toURI().toString();
			} else {
				thread.rootDir = thread.generalProperties.getProperty("webroot");
			}
			
			thread.rootUrl = req.getContextPath() + "/";
			
			try {
				String scriptPath;
				String originalURI = req.getRequestURI();
				//extract URL-MAP
				if (originalURI.indexOf("URL-MAP") != -1){
						String nomap = originalURI.substring(originalURI.indexOf("URL-MAP/")+7);
						String realPath = thread.rootDir + nomap.substring(thread.rootUrl.length());
						if (new File(realPath).exists()){
							this.getServletContext().getRequestDispatcher(nomap).forward(req,res);
							return;
						}
						Hashtable url_map = new Hashtable();
						String context = originalURI.substring(0,originalURI.indexOf("URL-MAP")-1);
						StringBuffer path=new StringBuffer();
						String[] parts = originalURI.substring(originalURI.indexOf("URL-MAP/")+8).split("/");
						int x;
						boolean scriptFound=false;
						for (x=0;x<parts.length;++x){
							if (scriptFound){
								if (x < parts.length -1){
										url_map.put(parts[x], parts[x+1]);
										++x;
								} else {
									url_map.put(parts[x], "");
								}
							} else {
								scriptFound = parts[x].matches("^.*\\.[e|s]js$");
								path.append("/" + parts[x]);
							}
						}
						scriptPath = thread.rootDir + path.substring(1);
						
						thread.environment.put("URL-MAP",url_map);
						/* res.getWriter().print(context + "<br>" + parts[0].toString() +"<br>" + scriptPath + "<br>" + url_map.toString());
						return; */
				
				} else {
					scriptPath = thread.rootDir + servletPath.substring(1);
				}
				File file = new File(new URI(scriptPath));
				if (
					file.exists()
					&& !file.isDirectory()
					//&& false
					&& !scriptPath.endsWith(".ws")
					&& !scriptPath.endsWith(".ejs")
					&& !scriptPath.endsWith(".sjs")
				){
				
					if (scriptPath.matches("^.*WEB-INF.*$")){
						res.sendError(403,"Access Denied.");	
						return;
					} else {
						new net.balusc.webapp.FileServer(
							file,
							this,
							req,
							res
						).serve(!this.type.equals("HEAD"));
					}
					
				} else {
					thread.handleRequest(scriptPath);
					if (!thread.requestHandled){
						//flush output
						res.setContentLength(thread.generatedContent.length());
						String ETag = new Integer(thread.generatedContent.toString().hashCode()).toString();
						String IfNoneMatch  =null;
						Enumeration IfNoneMatchHeaders = req.getHeaders("If-None-Match");
						if (IfNoneMatchHeaders.hasMoreElements()){
							IfNoneMatch = (String) IfNoneMatchHeaders.nextElement(); 
						} 
						res.setHeader("ETag",ETag);
						if (IfNoneMatch != null && IfNoneMatch.equals(ETag)){
							res.setStatus(304);		
						} else {
							res.getWriter().print(thread.generatedContent);	
						}	
					}	
				}
				
				
				
			} catch(Exception e){
				//res.getWriter().print("rhino catch" + e);
				thread.handleError(e);
				
				//flush any error output
				res.getWriter().print(thread.generatedContent);
			}
		} catch (Exception e){
			e.printStackTrace(System.err);
			
		}
		//res.getWriter().print("dbg: end request");
	}
	
	/**
	* Servlet entry point for post http method. 
	* 
	*
	* @param  req Servlet request object
	* @param  res Servlet response object
	*/
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException{
		this.type="POST";
		doGet(req,res);	
	}
	
	public void doHead(HttpServletRequest req, HttpServletResponse res)
		throws ServletException, IOException
	{
		this.type="HEAD";
		doGet(req,res);
	}
	
	/**
	* Servlet entry point for put http method. 
	* 
	*
	* @param  req Servlet request object
	* @param  res Servlet response object
	*/
	public void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException{
		this.type="PUT";
		doGet(req,res);	
	}
	
	/**
	* Servlet entry point for delete http method. 
	* 
	*
	* @param  req Servlet request object
	* @param  res Servlet response object
	*/
	public void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException{
		this.type="DELETE";
		doGet(req,res);	
	}
	
}
