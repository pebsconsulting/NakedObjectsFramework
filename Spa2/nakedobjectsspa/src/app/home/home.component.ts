import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { getAppPath } from "../config";
import { ActivatedRoute, Data } from '@angular/router';
import { UrlManagerService } from "../url-manager.service";
import { ContextService } from "../context.service";
import { ErrorService } from '../error.service';
import { ViewModelFactoryService } from "../view-model-factory.service";
import { ColorService } from "../color.service";
import { RouteData, PaneRouteData } from "../route-data";
import { LinkViewModel } from '../view-models/link-view-model';
import { MenusViewModel } from '../view-models/menus-view-model';
import { MenuViewModel } from '../view-models/menu-view-model';
import { PaneComponent } from '../pane/pane';
import * as Models from "../models";

@Component({
    // todo rename all selectors 
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends PaneComponent implements AfterViewInit {

    constructor(urlManager: UrlManagerService,
        activatedRoute: ActivatedRoute,
        private viewModelFactory: ViewModelFactoryService,
        private context: ContextService,
        private error: ErrorService,
        private color: ColorService,

        private myElement: ElementRef) {
        super(activatedRoute, urlManager);
    }

    // template API 
    get hasMenus() {
        return !!this.menus;
    }

    get menuItems() {
        return this.menus.items;
    }

    doClick(linkViewModel: LinkViewModel) {
        const menuId = linkViewModel.link.rel().parms[0].value;
        this.urlManager.setMenu(menuId, this.paneId);
    }

    title = (linkViewModel: LinkViewModel) => linkViewModel.title;

    selectedMenu: MenuViewModel;

    private menus: MenusViewModel;

    getMenus() {
        this.context.getMenus()
            .then((menus: Models.MenusRepresentation) => {
                this.menus = new MenusViewModel(this.viewModelFactory);
                const rd = this.urlManager.getRouteData().pane()[this.paneId];
                this.menus.reset(menus, rd);
            })
            .catch((reject: Models.ErrorWrapper) => {
                this.error.handleError(reject);
            });
    }

    getMenu(paneRouteData: PaneRouteData) {
        const menuId = paneRouteData.menuId;
        if (menuId) {
            this.context.getMenu(menuId)
                .then((menu: Models.MenuRepresentation) => {
                    // todo do we need to do this why can't we use passed in routeData ?
                    // perhaps could have changed ? 
                    const rd = this.urlManager.getRouteData().pane()[this.paneId];
                    this.selectedMenu = this.viewModelFactory.menuViewModel(menu, rd);
                })
                .catch((reject: Models.ErrorWrapper) => {
                    this.error.handleError(reject);
                });
        } else {
            this.selectedMenu = null;
        }
    }

    protected setup(routeData: PaneRouteData) {
        this.getMenus();
        this.getMenu(routeData);
    }

    // todo give #mms a better name 
    @ViewChildren('mms')
    menusEl: QueryList<ElementRef>;

    focusonFirstMenu(menus: QueryList<ElementRef>) {
        if (menus && menus.first && menus.first.nativeElement.children[0]) {
            menus.first.nativeElement.children[0].focus();
        }
    }

    // todo should this be on PaneComponent cf OnInit ? 
    ngAfterViewInit(): void {
        this.focusonFirstMenu(this.menusEl);
        this.menusEl.changes.subscribe((e: QueryList<ElementRef>) => {
            this.focusonFirstMenu(e);
        });
    }
}