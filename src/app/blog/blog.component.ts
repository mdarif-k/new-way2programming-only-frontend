import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { BlogService } from "../services/blog.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { NgxSpinnerService } from "ngx-spinner";
import { Title, Meta } from "@angular/platform-browser";
import { Blog } from "../models/blog";
import "rxjs/add/operator/map";
import * as ClipboardJS from "clipboard";
import * as _ from 'lodash';

@Component({
  selector: "blog",
  templateUrl: "./blog.component.html",
  styleUrls: ["./blog.component.css"]
})
export class BlogComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  blogData: Blog;
  leftNav;
  activeHref;
  keywords;
  desc;
  clipboard;
  activeInputForLeftNav: boolean = false;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private titleService: Title,
    private meta: Meta,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.clipboard = new ClipboardJS(".copy-button");
    
    this.route.url.subscribe(urlSegment => {
      let url = this.router.url.substring(1);
      this.subscription = this.blogService
        .getBlog({ blogHref: url })
        .subscribe(blogData => {
          this.blogData = blogData.json();
          this.activeHref = this.blogData.blogHref;
          this.keywords = this.blogData.blogKeyword;
          this.desc = this.blogData.blogDesc;
          this.titleService.setTitle(this.blogData.blogName);
          this.blogService
            .getLeftNav({ blogTech: this.blogData.blogTech })
            .subscribe(leftNav => {
              this.spinner.hide();
              this.leftNav = leftNav.json();
              this.leftNav = _.uniqWith(this.leftNav, _.isEqual);
          });
          this.meta.removeTag("name='author'");
          this.meta.removeTag("name='keywords'");
          this.meta.removeTag("name='description'");
          //setting meta params
          this.meta.addTags([
            {
              name: "author",
              content: "way2programming.com | Arif"
            },
            {
              name: "keywords",
              content: this.keywords
            },
            {
              name: "description",
              content: this.desc
            }
          ]);

          setTimeout(function() {
            var pre = document.getElementsByTagName("pre");
            for (var i = 0; i < pre.length; i++) {
              pre[i].className = "rel-pos border border-primary p-3";
              pre[i].id = "clipboard" + i;
              var button = document.createElement("button");
              button.className = "copy-button btn btn-primary";
              button.textContent = "Copy";
              var dataFromPreTag = pre[i].innerText;
              button.setAttribute("data-clipboard-text", dataFromPreTag);
              pre[i].appendChild(button);
            }
          }, 700);
        });
    });



    //check user is admin

    let ald = JSON.parse(localStorage.getItem('ald'));
    if(ald){
      this.activeInputForLeftNav = true;
    }
  }

  nextPage(href) {
    this.router.navigateByUrl(href);
    this.activeHref = href;
  }

  onKeyUpForUpdate(blogHref, sort, blogName) {
    this.blogService.updateLeftNavWithSortData({blogHref, sort, blogName});
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.clipboard.destroy();
  }
}
