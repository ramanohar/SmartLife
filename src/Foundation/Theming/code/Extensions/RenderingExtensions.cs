namespace Sitecore.Foundation.Theming.Extensions
{
    using System.Web.Mvc;
    using Sitecore.Data;
    using Sitecore.Foundation.SitecoreExtensions.Extensions;
    using Sitecore.Foundation.Theming.Extensions.Controls;
    using Sitecore.Mvc.Presentation;
    using Sitecore.Xml;
    using Data.Items;
    using Resources.Media;
    public static class RenderingExtensions
    {
        public static CarouselOptions GetCarouselOptions([NotNull] this Rendering rendering)
        {
            return new CarouselOptions
            {
                ItemsShown = rendering.GetIntegerParameter(Constants.CarouselLayoutParameters.ItemsShown, 3),
                AutoPlay = rendering.GetIntegerParameter(Constants.CarouselLayoutParameters.Autoplay, 1) == 1,
                ShowNavigation = rendering.GetIntegerParameter(Constants.CarouselLayoutParameters.ShowNavigation) == 1
            };
        }

        public static string GetBackgroundClass([NotNull] this Rendering rendering)
        {
            var id = MainUtil.GetID(rendering.Parameters[Constants.BackgroundLayoutParameters.Background] ?? "", null);
            if (ID.IsNullOrEmpty(id))
                return "";
            var item = rendering.RenderingItem.Database.GetItem(id);
            return item?[Templates.Style.Fields.Class] ?? "";
        }

        public static bool IsFixedHeight([NotNull] this Rendering rendering)
        {
            var isFixed = MainUtil.GetBool(rendering.Parameters[Constants.IsFixedHeightLayoutParameters.FixedHeight] ?? "", false);
            return isFixed;
        }

        public static int GetHeight([NotNull] this Rendering rendering)
        {
            return MainUtil.GetInt(rendering.Parameters[Constants.IsFixedHeightLayoutParameters.Height] ?? "", 0);
        }

        public static string GetContainerClass([NotNull] this Rendering rendering)
        {
            return rendering.IsContainerFluid() ? "container-fluid" : "container";
        }

        public static bool IsContainerFluid([NotNull] this Rendering rendering)
        {
            return MainUtil.GetBool(rendering.Parameters[Constants.HasContainerLayoutParameters.IsFluid], false);
        }

        public static BackgroundRendering RenderBackground([NotNull] this Rendering rendering, HtmlHelper helper)
        {
            return new BackgroundRendering(helper.ViewContext.Writer, rendering.GetBackgroundClass());
        }

        public static string GetBackgroundImage([NotNull] this Rendering rendering)
        {

            string imageField = rendering.Parameters[Constants.BackgroundLayoutParameters.BackgroundImage] ?? "";
            if (!string.IsNullOrEmpty(imageField))
            {
                var imageId = XmlUtil.GetAttribute("mediaid", XmlUtil.LoadXml(imageField));
                var imgfield = Context.Database.GetItem(imageId);
                if (imgfield != null)
                {
                    MediaItem image = new MediaItem(imgfield);
                    var mediaOptions = new MediaUrlOptions { AbsolutePath = true };
                    return MediaManager.GetMediaUrl(image, mediaOptions);
                }
            }

            return "";
        }
    }
}