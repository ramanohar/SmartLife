namespace Sitecore.Feature.Navigation.Models
{
    using System.Collections.Generic;
    using Sitecore.Mvc.Presentation;
    using System.Web;

    public class NavigationItems : RenderingModel
  {
        public HtmlString HeaderTitle { get; set; }

        public IList<NavigationItem> Items { get; set; }
  }
}